const BASE_URL = "https://discord.com";

type Embed = { title: string; description: string };

type AtLeastOneOf<T, K extends keyof T> = {
	[P in K]: Partial<T> & { [_P in P]: T[_P] };
}[K];

// 必ずcontent, embeds, sticker_ids, components, files, pollのいずれか1つが含まれている必要がある
// See docs: https://discord.com/developers/docs/resources/message#create-message-jsonform-params
export type Message = AtLeastOneOf<
	{
		content: string;
		embeds: Embed[];
		sticker_ids: string;
		components: unknown[];
		files: unknown;
		poll: unknown;
	},
	"content" | "embeds" | "sticker_ids" | "components" | "files" | "poll"
>;

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
			Authorization: `Bot ${discordToken}`,
		},
		body: JSON.stringify(message),
	});
};
