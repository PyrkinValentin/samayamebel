import type { MySql2Database } from "drizzle-orm/mysql2"
import type { Pool } from "mysql2/promise"

import { createPool } from "mysql2/promise"
import { drizzle } from "drizzle-orm/mysql2"
import { cacheAdapter } from "./utils"
import { schema } from "./schema"

import { MYSQL_URL, NODE_ENV } from "@/constants"

type Schema = typeof schema

const globalForDrizzle = globalThis as unknown as {
	pool: Pool | undefined
	mysql: MySql2Database<Schema> & { $client: Pool } | undefined
}

const pool = globalForDrizzle.pool ?? createPool({
	uri: MYSQL_URL,
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
})

export const mysql = globalForDrizzle.mysql ?? drizzle<Schema, Pool>(pool, {
	schema,
	mode: "default",
	cache: cacheAdapter,
})

if (NODE_ENV !== "production") {
	globalForDrizzle.pool = pool
	globalForDrizzle.mysql = mysql
}