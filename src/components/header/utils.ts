import type { LocationItem } from "./types"

import { LOCATION_EMPTY_NAME } from "@/constants"

export const getLocationId = (locationId: string | null, locations: LocationItem[]) => {
	return locationId ?? locations.at(0)?.id ?? null
}

export const getLocationName = (locationId: string | null, locations: LocationItem[]) => {
	const location = locations.find((location) => location.id === locationId)

	return location?.name ?? LOCATION_EMPTY_NAME
}

export const locationsToItems = (locations: LocationItem[]) => {
	return locations.map((location) => ({
		value: location.id,
		label: location.name,
	}))
}