import { type Message, SendMessageToChannel } from "../discord";

export const cronTask = async (env: CloudflareBindings) => {
	console.log("Cron job started at:", new Date().toISOString());

	const { kv } = env;
	const url = await kv.get("OPENAI:CHAT:LOOKBACK");
	if (url == null) {
		return await SendMessageToChannel(
			env.DISCORD_CHANNEL_ID,
			env.DISCORD_TOKEN,
		);
	}

	const content = `Here's today's reflection link:\n${url}`;
	const message: Message = {
		content,
	};
	const res = await SendMessageToChannel(
		env.DISCORD_CHANNEL_ID,
		env.DISCORD_TOKEN,
		message,
	);

	console.log(res);
	console.log(await res.text());
	console.log("Cron job finished at:", new Date().toISOString());
};
