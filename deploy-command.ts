import fs from 'node:fs';
import path from 'node:path';
import { exit } from 'node:process';



const dir = path.join(import.meta.dirname, 'command');

type Command = {
	name: string,
	description: string,
}

export const RegisterCommands = async (): Promise<Command[]> => {
	const commands = [];
	const files = fs.readdirSync(dir).filter(file => file.endsWith('.js'));

	for (const file of files) {
		const filePath = path.join(dir, file);
		const command = await import(filePath);
		if (command?.data && command?.execute) {
			commands.push(command?.data.toJSON());
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
			exit(1)
		}
	}

	return commands
}
