import { AsyncLocalStorage } from "node:async_hooks";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";
import { Webhook } from "svix";

const require = createRequire(import.meta.url);

describe("patched production dependency boundaries", () => {
  it("keeps UploadThing's Effect fibers inside their own request identity", async () => {
    // Resolve the actual transitive copy used by UploadThing, not a separately
    // installed test dependency. Before the patch 63 of these 64 reads mixed
    // request identities (GHSA-38f7-945m-qr2g).
    const uploadRequire = createRequire(require.resolve("uploadthing/next"));
    const { Effect } = uploadRequire("effect");
    const requestIdentity = new AsyncLocalStorage<number>();
    const results = await Promise.all(Array.from({ length: 64 }, (_, expected) =>
      requestIdentity.run(expected, () => Effect.runPromise(Effect.gen(function* () {
        yield* Effect.yieldNow();
        return { expected, actual: requestIdentity.getStore() };
      })))
    ));
    for (const result of results) expect(result.actual).toBe(result.expected);
  });

  it("still verifies valid webhook deliveries and rejects a changed payload", () => {
    const webhook = new Webhook(`whsec_${Buffer.alloc(32, 7).toString("base64")}`);
    const payload = JSON.stringify({ type: "user.created", data: { id: "test_user" } });
    const timestamp = new Date();
    const id = "msg_local_regression_test";
    const headers = {
      "svix-id": id,
      "svix-timestamp": String(Math.floor(timestamp.getTime() / 1000)),
      "svix-signature": webhook.sign(id, timestamp, payload),
    };
    expect(webhook.verify(payload, headers)).toEqual(JSON.parse(payload));
    expect(() => webhook.verify(payload.replace("test_user", "other_user"), headers)).toThrow();
  });

  it("keeps Next's patched image dependency able to resize and encode WebP", async () => {
    const nextRequire = createRequire(require.resolve("next"));
    const sharp = nextRequire("sharp");
    const output = await sharp({ create: {
      width: 2, height: 2, channels: 3, background: { r: 248, g: 205, b: 2 },
    } }).resize(1, 1).webp().toBuffer();
    const metadata = await sharp(output).metadata();
    expect(metadata).toMatchObject({ width: 1, height: 1, format: "webp" });
  });
});
