import { Message, REST, Routes } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { parseConfig } from './env.js';

import * as fs from "node:fs";
import * as path from "node:path";
import { RegisterCommands } from './deploy-command.js';

const config = parseConfig()

const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

const commands = await RegisterCommands()

console.log(commands)
try {
	console.log(`Started refreshing ${commands.length} application (/) commands.`);

	await rest.put(Routes.applicationCommands(config.DISCORD_APP_ID), { body: commands });

	console.log('Successfully reloaded application commands.');
} catch (error) {
	console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });


client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(config.DISCORD_TOKEN)
