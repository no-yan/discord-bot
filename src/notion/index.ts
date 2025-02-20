import { z } from "zod";
import { validateSchema } from "../api/validator";

export type Task = {
	id: string;
	title: string;
};
export type Tasks = Task[];

const NOTION_VERSION = "2022-06-28";

export const FetchTodayTasks = async (
	dbId: string,
	token: string,
): Promise<Tasks> => {
	const today = new Date().toISOString().split("T")[0];
	const filter = {
		property: "実施予定日",
		date: {
			equals: today,
		},
	};

	const res = await fetchDbWithCompoundFilter(dbId, token, filter);

	const tasks: Tasks = res.results.map((page) => {
		const title = page.properties.名前.title[0].plain_text;

		return {
			id: page.id,
			title,
		};
	});

	return tasks;
};

const taskSchema = z.object({
	ステータス: z.object({
		id: z.string(),
		type: z.literal("status"),
		status: z.object({
			name: z.string(),
		}),
	}),
	終了時間: z.any().optional(),
	開始: z.any().optional(),
	予定時間: z
		.object({
			id: z.string(),
			type: z.literal("formula"),
			formula: z.any(),
		})
		.nullable(),
	タスク種別: z.any(),
	"Parent item": z.any(),
	開始時刻: z.any(),
	終了: z.any(),
	実施予定日: z
		.object({
			id: z.string(),
			type: z.literal("date"),
			date: z
				.object({
					start: z.string().nullable(),
					end: z.string().nullable(),
					time_zone: z.string().nullable(),
				})
				.partial(),
		})
		.optional(),

	気持ち: z.any(),
	"Sub-item": z.any(),

	名前: z.object({
		id: z.string(),
		type: z.literal("title"),
		title: z.array(
			z.object({
				type: z.string(),
				text: z
					.object({
						content: z.string(),
						link: z.string().nullable(),
					})
					.nullable(),
				plain_text: z.string(),
				href: z.string().nullable().optional(),
			}),
		),
	}),
});

const schema = z.object({
	object: z.literal("list"),
	results: z.array(
		z.object({
			id: z.string(),
			properties: taskSchema,
		}),
	),
	next_cursor: z.string().nullable(),
	has_more: z.boolean(),
});

export type DBQueryResponse = z.infer<typeof schema>;
const validate = (dto: unknown): DBQueryResponse => {
	return validateSchema({ dto, schema, schemaName: "v1/account/details" });
};

// doc: https://developers.notion.com/reference/post-database-query#compound-filters
type Filter = object; // TODO:

const fetchDbWithCompoundFilter = async (
	dbId: string,
	token: string,
	filter: Filter,
): Promise<DBQueryResponse> => {
	const url = `https://api.notion.com/v1/databases/${dbId}/query`;
	const headers = {
		Authorization: `Bearer ${token}`,
		"Notion-Version": NOTION_VERSION,
		"Content-Type": "application/json",
	};

	const res = await fetch(url, {
		method: "POST",
		headers,
		body: JSON.stringify({
			filter,
			// sorts: [...] // 並び順を指定したい場合は sorts を指定
			page_size: 50,
		}),
	});

	if (!res.ok) {
		const errorBody = await res.text();
		throw new Error(`Notion API Error: [${res.status}] ${errorBody}`);
	}

	const data = await res.json();
	return validate(data);
};
