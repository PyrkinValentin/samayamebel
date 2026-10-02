import { defineConfig } from "drizzle-kit"

import { MYSQL_URL } from "@/constants"

export default defineConfig({
	out: "./drizzle",
	schema: "./src/libs/mysql/schema/*",
	dialect: "mysql",
	dbCredentials: {
		url: MYSQL_URL,
	},
})