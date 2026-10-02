import { createService } from "@/libs/service"
import { schema } from "@/shared/mysql-schema"
import { asc } from "drizzle-orm"

export const Location = createService({
	table: schema.location,
	defaultOrderBy: {
		findMany: [
			asc(schema.location.sortOrder),
			asc(schema.location.name),
		],
	},
})