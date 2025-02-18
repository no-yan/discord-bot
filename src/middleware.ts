import { verifyKey } from "discord-interactions";
import { env } from "hono/adapter";
import { createMiddleware } from "hono/factory";

export const verifyKeyMiddleware = createMiddleware<{
	// biome-ignore lint/style/useNamingConvention: <explanation>
	Bindings: CloudflareBindings;
}>(async (c, next) => {
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
});
