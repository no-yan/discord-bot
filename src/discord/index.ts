const BASE_URL = "https://discord.com";
export const SendMessageToChannel = async (
	channelId: string,
	discordToken: string,
) => {
	const url = new URL(`/api/v10/channels/${channelId}/messages`, BASE_URL);
	console.log({ url });

	return fetch(url, {
		method: "POST",
		headers: {
			"User-Agent": `DiscordBot (${url}, 10)`,
			"Content-Type": "application/json",
			// biome-ignore lint/style:
			Authorization: `Bot ${discordToken}`,
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
};
