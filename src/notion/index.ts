import { z } from "zod";
import { validateSchema } from "../api/validator";

export type Task = any;
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
	try {
		const res = await fetchDbWithCompoundFilter(dbId, token, filter);
		console.log(res);

		const tasks: Tasks = res.results.map((page) => {
			const title = page.properties.Name.title;

			return {
				id: page.id,
				title,
			};
		});

		return tasks;
	} catch (e) {
		console.log(e);
		return [];
	}
};

const taskSchema = z.object({
	ステータス: z.string(),
	プロジェクト: z.string(),
	実施予定日: z.string(),
	"Parent item": z.string(),
	"Sub-item": z.string(),
	タスク種別: z.string(),
	気持ち: z.string(),
	予定時間: z.string(),
	開始時刻: z.string(),
	終了時間: z.string(),
	開始: z.string(),
	終了: z.string(),
	Name: z.object({
		id: z.string(),
		type: z.string(),
		title: z.object({
			type: z.string(),
			text: z.string(),
			plain_text: z.string(),
		}),
	}),
});

const schema = z.object({
	object: z.literal("list"),
	results: z.array(
		z.object({
			id: z.string().uuid(),
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
