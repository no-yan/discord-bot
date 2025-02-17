import { z } from "zod";

const schema = z.object({
	// DiscordのIDは数値型だが文字列として扱っている
	// IDが数値としてNumber.MAX_SAFE_INTEGERより大きく、変換すると値に誤差が出るため、数値に変換するとIDが変わってしまうことがある
	DISCORD_APP_ID: z.string().min(18),
	DISCORD_GUILD_ID: z.string().min(18),

	DISCORD_TOKEN: z.string().min(1),
	DISCORD_PUBLIC_KEY: z.string().min(1),
});

type Schema = z.infer<typeof schema>;
export type Config = Schema;

export function parseConfig(): Config {
	const config = schema.safeParse(process.env);

	if (config.error) {
		console.error("\x1b[31m%s\x1b[0m", "[Errors] environment variables");
		console.error(JSON.stringify(config.error.errors, null, 2));
		process.exit(1);
	}

	return config.data;
}
