import {
	type APIInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { Hono } from "hono";

import { logger } from "hono/logger";
import { NewCommands } from "./command/index.js";
import { Ping } from "./command/ping.js";
import { verifyKeyMiddleware } from "./middleware.js";

const app = new Hono<{ Bindings: CloudflareBindings }>();
const commands = NewCommands(Ping);

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

	for (const cmd of commands) {
		if (cmd.name === name.toLowerCase()) {
			return cmd.execute(c);
		}
	}

	return c.json({ error: "Unknown Command" }, 400);
});

