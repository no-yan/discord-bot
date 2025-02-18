const BASE_URL = "https://discord.com";

type Embed = { title: string; description: string };

type AtLeastOne<T, K extends keyof T = keyof T> = K extends any
	? Pick<T, K> & Partial<Omit<T, K>>
	: never;

// See docs: https://discord.com/developers/docs/resources/message#create-message-jsonform-params
export type Message = AtLeastOne<{
	content: string;
	embeds: Embed[];
}>;

const defaultMessage = {
	content: "Hello, World!",
	embeds: [
		{
			title: "Hello, Embed!",
			description: "This is an embedded message.",
		},
	],
};

export const SendMessageToChannel = async (
	channelId: string,
	discordToken: string,
	message: Message = defaultMessage,
) => {
	const url = new URL(`/api/v10/channels/${channelId}/messages`, BASE_URL);

	return fetch(url, {
		method: "POST",
		headers: {
			"User-Agent": `DiscordBot (${url}, 10)`,
			"Content-Type": "application/json",
			// biome-ignore lint/style:
			Authorization: `Bot ${discordToken}`,
		},
		body: JSON.stringify(message),
	});
};
