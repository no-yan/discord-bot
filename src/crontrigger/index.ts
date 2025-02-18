import { CreateDiscordMessage } from "../discord";

export const cronTask = async (env: CloudflareBindings) => {
	console.log("Cron job started at:", new Date().toISOString());

	const res = await CreateDiscordMessage(
		env.DISCORD_CHANNEL_ID,
		env.DISCORD_TOKEN,
	);
	console.log(res);
	console.log(await res.text());
	console.log("Cron job finished at:", new Date().toISOString());
};
