import { type Message, SendMessageToChannel } from "../discord";
import { FetchTodayTasks } from "../notion";

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

export const cronTaskNotion = async (env: CloudflareBindings) => {
	console.log("Cron job started at:", new Date().toISOString());

	const { kv } = env;
	const url = await kv.get("OPENAI:CHAT:LOOKBACK");
	if (url == null) {
		return await SendMessageToChannel(
			env.DISCORD_CHANNEL_ID,
			env.DISCORD_TOKEN,
		);
	}

	const tasks = await FetchTodayTasks(env.NOTION_DB_ID, env.NOTION_TOKEN).catch(
		(_) => [],
	);

	let content = `Here's today's task link:\n`;
	for (const task of tasks) {
		content += `\n${task.title}`;
	}
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
