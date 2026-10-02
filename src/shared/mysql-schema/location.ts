import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core"
import { relations } from "drizzle-orm"

// import { callback } from "./callback"

import {
	UUID_MAX_LENGTH,
	LOCATION_VALUE_MAX_LENGTH,
	LOCATION_NAME_MAX_LENGTH,
	PHONE_NUMBER_MAX_LENGTH,
} from "@/constants"

export type InsertLocation = typeof location.$inferInsert
export type SelectLocation = typeof location.$inferSelect

export const location = mysqlTable("locations", {
	id: varchar("id", { length: UUID_MAX_LENGTH })
		.primaryKey()
		.$defaultFn(crypto.randomUUID),
	value: varchar("value", { length: LOCATION_VALUE_MAX_LENGTH })
		.notNull()
		.unique(),
	name: varchar("name", { length: LOCATION_NAME_MAX_LENGTH })
		.notNull()
		.unique(),
	phoneNumber: varchar("phone_number", { length: PHONE_NUMBER_MAX_LENGTH })
		.notNull(),
	sortOrder: int("sort_order")
		.notNull()
		.default(0),
})

// export const locationRelations = relations(location, (relations) => ({
// 	callbacks: relations.many(callback),
// }))