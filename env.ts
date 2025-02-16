import { z } from "zod";



const schema = z.object({
	DISCORD_APP_ID: z.string().min(19), // 数値型だが、Number.MAX_SAFE_INTEGERより大きいため、変換すると値に誤差が出る
	DISCORD_TOKEN: z.string().min(1),
	DISCORD_PUBLIC_KEY: z.string().min(1),
});

export type Schema = z.infer<typeof schema>;
export type Config = z.infer<typeof schema>

export function parseConfig(): Config {
	const config = schema.safeParse(process.env);

	if (config.error) {
		console.error("\x1b[31m%s\x1b[0m", "[Errors] environment variables");
		console.error(JSON.stringify(config.error.errors, null, 2));
		process.exit(1);
	}

	return config.data
}
