import { verifyKey } from "discord-interactions";
import type { MiddlewareHandler } from "hono";
import { env } from "hono/adapter";

export const verifyKeyMiddleware =
	// biome-ignore lint/style: Binding is type, so it's ok to use Pascal
		(): MiddlewareHandler<{ Bindings: CloudflareBindings }> =>
		async (c, next) => {
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
