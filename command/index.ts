import type { Context } from "hono";
import type { Env } from "../src/env.js";

export type Command = {
	name: string;
	description: string;
	execute: (c: Context) => void;
};
export type CommandHandler = Command["execute"];

export type Commands = Command[];

export const NewCommands = (...commands: Command[]): Commands => {
	return [...commands];
};

declare const brandSymbol: unique symbol;
type Brand<T, B> = T & { [brandSymbol]: B };
const brand = <T, B>(value: T): Brand<T, B> => value as Brand<T, B>;

type CommandDTO = Brand<{ name: string; description: string }, "command">;

export const NewCommandDTO = (command: Command): CommandDTO =>
	brand({
		name: command.name,
		description: command.description,
	});

export async function Register(
	commands: CommandDTO[],
	config: Env,
): Promise<Response> {
	const registerURL = `https://discord.com/api/v10/applications/${config.DISCORD_APP_ID}/guilds/${config.DISCORD_GUILD_ID}/commands`;
	const response = await fetch(registerURL, {
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bot ${config.DISCORD_TOKEN}`,
		},
		method: "PUT",
		body: JSON.stringify(commands),
	});

	if (response.ok) {
		console.log("Registered all commands");
	} else {
		console.error("Error registering commands");
		const text = await response.text();
		console.error(text);
	}
	return response;
}
