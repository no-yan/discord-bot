import { verifyKey } from "discord-interactions";
import type { MiddlewareHandler } from "hono";
import type { Config } from "./env";

export const verifyKeyMiddleware =
	(publicKey: string): MiddlewareHandler<{ Bindings: Config }> =>
	async (c, next) => {
		const signature = c.req.header("X-Signature-Ed25519");
		const timestamp = c.req.header("X-Signature-Timestamp");
		const body = await c.req.raw.clone().text();
		const isValidRequest =
			signature &&
			timestamp &&
			(await verifyKey(body, signature, timestamp, publicKey));

		if (!isValidRequest) {
			return c.text("Bad request signature", 401);
		}
		return await next();
	};
