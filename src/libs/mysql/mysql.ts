import type { MySql2Database } from "drizzle-orm/mysql2"
import type { Pool } from "mysql2/promise"

import { createPool } from "mysql2/promise"
import { drizzle } from "drizzle-orm/mysql2"
import { cache } from "./cache"
import { schema } from "@/shared/mysql-schema"

import { MYSQL_URL, NODE_ENV } from "@/constants"

type Schema = typeof schema

const globalForMysql = globalThis as unknown as {
	pool?: Pool
	mysql?: MySql2Database<Schema> & { $client: Pool }
}

const pool =
	globalForMysql.pool ??
	createPool({
		uri: MYSQL_URL,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	})

export const mysql =
	globalForMysql.mysql ??
	drizzle<Schema, Pool>(pool, {
		schema,
		mode: "default",
		cache,
	})

if (NODE_ENV !== "production") {
	globalForMysql.pool = pool
	globalForMysql.mysql = mysql
}