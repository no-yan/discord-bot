import { REST, Routes } from 'discord.js';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { parseConfig } from './env.js';


const config = parseConfig()

const commands = [
	{
		name: 'ping',
		description: 'Replies with Pong!',
	},
];


const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);


try {
	console.log('Started refreshing application (/) commands.');

	console.log(config.DISCORD_APP_ID.toString())
	await rest.put(Routes.applicationCommands(config.DISCORD_APP_ID.toString()), { body: commands });

	console.log('Successfully reloaded application (/) commands.');
} catch (error) {
	console.error(error);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on(Events.ClientReady, readyClient => {
	console.log(`Logged in as ${readyClient.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
	}
})

client.login(config.DISCORD_TOKEN);

