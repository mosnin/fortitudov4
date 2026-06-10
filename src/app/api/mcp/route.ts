import { NextResponse } from "next/server";
import { getAgentPrincipal } from "@/lib/agent-auth";
import { MCP_TOOLS, runMcpTool } from "@/lib/mcp-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Model Context Protocol server (stateless JSON-RPC over HTTP) for Claude /
// Claude cowork. Authenticate with an API key: `Authorization: Bearer <key>`.
// Mint a key in Settings → API keys.

const PROTOCOL_VERSION = "2024-11-05";

type JsonRpc = { jsonrpc: "2.0"; id?: string | number | null; method: string; params?: Record<string, unknown> };

function ok(id: JsonRpc["id"], result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}
function err(id: JsonRpc["id"], code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

export async function POST(req: Request) {
  // Auth — getAgentPrincipal throws a NextResponse on failure.
  let principal;
  try {
    principal = await getAgentPrincipal(req);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: JsonRpc | JsonRpc[];
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }

  const handleOne = async (msg: JsonRpc) => {
    const { id, method, params } = msg;
    switch (method) {
      case "initialize":
        return ok(id, {
          protocolVersion: (params?.protocolVersion as string) ?? PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: { name: "Fortitudo Build", version: "1.0.0" },
        });
      case "notifications/initialized":
      case "notifications/cancelled":
        return null; // notifications get no response
      case "ping":
        return ok(id, {});
      case "tools/list":
        return ok(id, { tools: MCP_TOOLS });
      case "tools/call": {
        const name = params?.name as string;
        const args = (params?.arguments as Record<string, unknown>) ?? {};
        try {
          const result = await runMcpTool(principal, name, args);
          return ok(id, result);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Tool failed";
          return ok(id, { content: [{ type: "text", text: message }], isError: true });
        }
      }
      default:
        if (id === undefined || id === null) return null; // unknown notification
        return err(id, -32601, `Method not found: ${method}`);
    }
  };

  if (Array.isArray(body)) {
    const responses = (await Promise.all(body.map(handleOne))).filter(Boolean);
    return NextResponse.json(responses);
  }

  const response = await handleOne(body);
  if (response === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(response);
}

// Streamable HTTP clients may open a GET for server-sent events; this server is
// request/response only, so there is no stream to provide.
export function GET() {
  return new NextResponse("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
}
