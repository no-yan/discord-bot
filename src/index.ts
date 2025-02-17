import {
	type APIInteraction,
	type APIInteractionResponse,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { Hono } from "hono";

import { logger } from "hono/logger";
import type { Env } from "./env.js";
import { verifyKeyMiddleware } from "./middleware.js";

// const config = parseConfig();
// const commands = await GetCommands();
// const res = await Register(commands, config);
// if (res.status !== 200) {
// }
//
const app = new Hono<{ Bindings: Env }>();

app.use(logger(), verifyKeyMiddleware());

app.post("/interactions", async (c) => {
	const body: APIInteraction = JSON.parse(await c.req.text());
	if (!body) {
		return c.text("Bad request", 401);
	}

	if (body.type === InteractionType.Ping) {
		return c.json({ type: InteractionResponseType.Pong });
	}

	if (
		body.type !== InteractionType.ApplicationCommand ||
		body.data.type !== ApplicationCommandType.ChatInput
	) {
		return c.json({ error: "Unknown Type" }, 400);
	}

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
});

export default app;
