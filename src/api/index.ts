import type { ZodTypeAny, z } from "zod";

export class ValidationError extends Error {
	override readonly name = "ValidationError" as const;
	constructor(message: string, options?: { cause: unknown }) {
		super(message, options);
		this.cause = options?.cause;
	}
}

// https://laniewski.me/blog/2023-11-19-api-response-validation-with-zod/
interface ValidateConfig<T extends z.ZodTypeAny> {
	dto: unknown;
	schema: T;
	schemaName: string;
}

export const validateSchema = <T extends ZodTypeAny>(
	config: ValidateConfig<T>,
): z.infer<T> => {
	const { success, error, data } = config.schema.safeParse(config.dto);
	if (success) {
		return data;
	}

	captureError(`API Validation Error: ${config.schemaName}`, {
		dto: config.dto,
		error: error.message,
		issues: error.issues,
	});

	throw new ValidationError(`API Validation Error: ${config.schemaName}`, {
		cause: error,
	});
};

function captureError(msg: string, extra = {}) {
	console.error(msg, extra);
}
