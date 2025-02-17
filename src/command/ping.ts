import {
	type APIInteractionResponse,
	InteractionResponseType,
} from "discord-api-types/v10";
import type { Context } from "hono";
import type { Command, CommandHandler } from ".";

const handler: CommandHandler = (c: Context) => {
	return c.json<APIInteractionResponse>({
		type: InteractionResponseType.ChannelMessageWithSource,
		data: {
			content: "Pong",
		},
	});
};

export const Ping: Command = {
	name: "ping",
	description: "Replies with Pong!!!!",
	execute: handler,
};
