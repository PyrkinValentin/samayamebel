"use client"

import type { LocationItem } from "./types"

import { useMemo } from "react"

import { locationsToItems } from "./utils"

import { Select } from "@cora-ui/react"

type HeaderLocationsSelectProps = {
	locationId: string | null
	locations: LocationItem[]
	onLocationIdChange: (locationId: string | null) => void
}

export const HeaderLocationsSelect = (props: HeaderLocationsSelectProps) => {
	const {
		locationId,
		locations,
		onLocationIdChange,
	} = props

	const items = useMemo(() => locationsToItems(locations), [locations])

	const hasItems = items.length > 0

	return (
		<Select.Root
			value={locationId}
			items={items}
			onValueChange={onLocationIdChange}
		>
			<Select.Trigger className="mt-6">
				<Select.Value placeholder="Выберите населенный пункт"/>
				<Select.Icon/>
			</Select.Trigger>

			<Select.Portal>
				<Select.Positioner>
					<Select.Popup>
						<Select.List>
							{items.map((item) => (
								<Select.Item
									key={item.value}
									value={item.value}
								>
									<Select.ItemText>{item.label}</Select.ItemText>
									<Select.ItemIndicator/>
								</Select.Item>
							))}

							{!hasItems && (
								<span className="px-2 py-2 text-sm text-muted">
									Список населенных пунктов пуст
								</span>
							)}
						</Select.List>
					</Select.Popup>
				</Select.Positioner>
			</Select.Portal>
		</Select.Root>
	)
}