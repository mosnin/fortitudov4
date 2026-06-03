import { NextResponse } from "next/server";
import { catalog } from "@/lib/catalog";

// Public catalog of productized starting points (the hybrid on-ramp).
export async function GET() {
  return NextResponse.json({ items: catalog });
}
