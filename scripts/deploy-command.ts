import fs from "node:fs";
import path from "node:path";
import { exit } from "node:process";
import type { Env } from "../src/env.js";

const dir = path.join(import.meta.dirname, "command");
type Command = {
	name: string;
	description: string;
};

export const GetCommands = async (): Promise<Command[]> => {
	const commands = [];
	const files = fs.readdirSync(dir).filter((file) => file.endsWith(".js"));

	for (const file of files) {
		const filePath = path.join(dir, file);
		const command = await import(filePath);
		// if (command?.data && command?.execute) {
		if (command?.data) {
			commands.push(command.data as Command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
			);
			exit(1);
		}
	}

	return commands;
};

export async function Register(
	commands: Command[],
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
