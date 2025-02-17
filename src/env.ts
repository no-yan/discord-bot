import { z } from "zod";

const schema = z.object({
	// JavaScriptのNumber型は、2^53-1を超える整数に対して正確な値を保持できない
	// DiscordのIDは64bit整数のため、 Bigint型に変換して丸めが起こらないようにしている
	DISCORD_APP_ID: z.coerce.bigint().min(1n),
	DISCORD_GUILD_ID: z.coerce.bigint().min(1n),

	DISCORD_TOKEN: z.string().min(1),
	DISCORD_PUBLIC_KEY: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

export function ValidateEnv(): Env {
	const config = schema.safeParse(process.env);

	if (config.error) {
		console.error("\x1b[31m%s\x1b[0m", "[Errors] environment variables");
		console.error(JSON.stringify(config.error.errors, null, 2));
		process.exit(1);
	}

	return config.data;
}
