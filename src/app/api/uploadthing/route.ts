import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Serves the UploadThing handshake + callbacks. Requires UPLOADTHING_TOKEN.
export const { GET, POST } = createRouteHandler({ router: ourFileRouter });
