import { verifyKey } from "discord-interactions";
import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";
import type { Env } from "./env";

export const verifyKeyMiddleware =
	(): MiddlewareHandler<{ Bindings: Env }> => async (c, next) => {
		const { DISCORD_PUBLIC_KEY } = env(c);
		const signature = c.req.header("X-Signature-Ed25519");
		const timestamp = c.req.header("X-Signature-Timestamp");
		const body = await c.req.raw.clone().text();
		const isValidRequest =
			signature &&
			timestamp &&
			(await verifyKey(body, signature, timestamp, DISCORD_PUBLIC_KEY));

		if (!isValidRequest) {
			return c.text("Bad request signature", 401);
		}
		return await next();
	};
