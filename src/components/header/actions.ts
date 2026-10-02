"use server"

import { actionClient, cookiesMiddleware } from "@/shared/action-client"
import { updateLocationSchema } from "./schemas"

import { LOCATION_COOKIE_NAME, LOCATION_COOKIE_OPTIONS } from "@/constants"

export const updateLocationAction = actionClient
	.use(cookiesMiddleware)
	.inputSchema(updateLocationSchema)
	.action(async (options) => {
		const { inferInput, context } = options

		if (inferInput.id) {
			context.cookies.set(
				LOCATION_COOKIE_NAME,
				inferInput.id,
				LOCATION_COOKIE_OPTIONS,
			)
		}
	})