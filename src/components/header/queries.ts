import type { LocationItem } from "./types"

import { cookies } from "next/headers"
import { Location } from "@/services"

import { LOCATION_COOKIE_NAME } from "@/constants"

export type HeaderData = {
	selectedLocationId: string | null
	locations: LocationItem[]
}

export const getHeaderData = async (): Promise<HeaderData> => {
	const cookieStore = await cookies()
	const selectedLocationId = cookieStore.get(LOCATION_COOKIE_NAME)?.value ?? null

	const locations = await Location.findMany({
		fields: {
			id: Location.id,
			value: Location.value,
			name: Location.name,
		},
	})

	return {
		selectedLocationId,
		locations,
	}
}