const BASE_URL = "https://discord.com";
const cronTask = async (env: CloudflareBindings) => {
	console.log("Cron job started at:", new Date().toISOString());

	const url = new URL(
		`/api/v10/channels/${env.DISCORD_CHANNEL_ID}/messages`,
		BASE_URL,
	);
	console.log({ url });

	const res = await fetch(url, {
		method: "POST",
		headers: {
			"User-Agent": `DiscordBot (${url}, 10)`,
			"Content-Type": "application/json",
			Authorization: `Bot ${env.DISCORD_TOKEN}`,
		},
		body: JSON.stringify({
			content: "Hello, World!",
			tts: false,
			embeds: [
				{
					title: "Hello, Embed!",
					description: "This is an embedded message.",
				},
			],
		}),
	});

	console.log("Cron job finished at:", new Date().toISOString());
	console.log(res);
	console.log(await res.text());
};
