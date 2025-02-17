import {
	type APIInteraction,
	type APIInteractionResponse,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { Hono } from "hono";
import { parseConfig } from "./env.js";

import { exit } from "node:process";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";
import { GetCommands, Register } from "./deploy-command.js";
import { verifyKeyMiddleware } from "./middleware.js";

const config = parseConfig();
const commands = await GetCommands();
const res = await Register(commands, config);
if (res.status !== 200) {
	exit(1);
}

const app = new Hono<{ Bindings: typeof config }>();

app.use(logger(), verifyKeyMiddleware(config.DISCORD_PUBLIC_KEY));
app.use("*", async (c, next) => {
	c.env = { ...c.env, ...config };

	await next();
});

app.post("/", async (c) => {
	const body: APIInteraction = JSON.parse(await c.req.text());
	if (!body) {
		return c.text("Bad request", 401);
	}

	if (body.type === InteractionType.Ping) {
		return c.json({ type: InteractionResponseType.Pong });
	}

	if (
		body.type === InteractionType.ApplicationCommand &&
		body.data.type === ApplicationCommandType.ChatInput
	) {
		const { name } = body.data;
		switch (name.toLowerCase()) {
			case "ping": {
				return c.json<APIInteractionResponse>({
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: "Pong",
					},
				});
			}
			default: {
				try {
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
			}
		}
	}

	return c.json({ error: "Unknown Type" }, 400);
});

serve(app, (info) => {
	console.log(`Listening on http://localhost:${info.port}`);
});

export default app;
