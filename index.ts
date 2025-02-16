import {
	type APIInteractionResponse,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { Hono } from "hono";
import { parseConfig } from "./env.js";

import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { verifyKeyMiddleware } from "./verify.js";
import { RegisterCommands } from "./deploy-command.js";

const config = parseConfig();
await RegisterCommands();

const app = new Hono<{ Bindings: typeof config }>();

app.use(logger(), verifyKeyMiddleware(config.DISCORD_PUBLIC_KEY));
app.use("*", async (c, next) => {
	c.env = { ...c.env, ...config };

	await next();
});

app.post("/", async (c) => {
	const body = JSON.parse(await c.req.text());
	if (body.type === InteractionType.Ping) {
		console.log("pong");
		return c.json({ type: InteractionResponseType.Pong });
	}

	if (!body) {
		return c.text("Bad request signature.", 401);
	}
	if (
		body.type === InteractionType.ApplicationCommand &&
		body.data.type === ApplicationCommandType.ChatInput
	) {
		// switch (interaction.data.name.toLowerCase()) {
		try {
			console.log("chat");
			return c.json<APIInteractionResponse>({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: "hi",
				},
			});
		} catch (e) {
			console.error(e);
			return c.json<APIInteractionResponse>({
				type: InteractionResponseType.ChannelMessageWithSource,
				data: {
					content: `キロロはお休み中キロＺｚｚ...\n${e}`,
				},
			});
		}
		// return c.json({ error: 'Unknown Type' }, 400);
	}

	console.log(body);
	return c.json({ error: "Unknown Type" }, 400);
});

serve(app, (info) => {
	console.log(`Listening on http://localhost:${info.port}`);
});

export default app;
