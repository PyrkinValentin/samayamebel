import { createMiddleware } from "@/libs/action"
import { cookies } from "next/headers"

export const cookiesMiddleware = createMiddleware(async (options) => {
	return options.next({
		context: {
			cookies: await cookies(),
		},
	})
})