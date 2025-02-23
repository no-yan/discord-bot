import {
	type APIInteraction,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
} from "discord-api-types/v10";
import { Hono } from "hono";

import { env } from "hono/adapter";
import { logger } from "hono/logger";
import { NewCommands, Ping } from "./command";
import { cronTask, cronTaskNotion } from "./crontrigger/index.js";
import { verifyKeyMiddleware } from "./middleware.js";

const app = new Hono<{ Bindings: CloudflareBindings }>();
const commands = NewCommands(Ping);

app.use(logger());
app.use("/interactions", verifyKeyMiddleware);

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

app.get("/kv", async (c) => {
	const { kv } = env(c);
	const page = await kv.get("index.html");

	if (page == null) {
		return c.html("", 404);
	}
	return c.html(page);
});

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = async (
	event,
	env,
	ctx,
) => {
	console.log(event.cron);
	switch (event.cron) {
		case "0 12 * * *": {
			return ctx.waitUntil(cronTask(env));
		}
		case "0 0 */3 * *": {
			return ctx.waitUntil(cronTaskNotion(env));
		}
		default: {
			console.warn("unknown cron command", event.cron);
			return ctx.waitUntil(cronTask(env));
		}
	}
};

export default {
	...app,
	scheduled,
};
