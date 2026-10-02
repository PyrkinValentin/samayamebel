"use client"

import type { LocationItem } from "./types"

import { useMemo, useState } from "react"
// import { useOptimisticAction } from "@/hooks"

import { getLocationId, getLocationName } from "./utils"
import { updateLocationAction } from "./actions"
import { toastError } from "@/components/toast"
import { formatErrors } from "@/utils"

import { Dialog, Spinner } from "@cora-ui/react"
import { ChevronDown, Navigation } from "lucide-react"
import { HeaderLocationsSelect } from "./header-locations-select"

type HeaderLocationsProps = {
	selectedLocationId: string | null
	locations: LocationItem[]
}

export const HeaderLocations = (props: HeaderLocationsProps) => {
	const { selectedLocationId, locations } = props

	const [open, setOpen] = useState(false)

	// const {
	// 	isExecuting,
	// 	optimisticState,
	// 	execute,
	// } = useOptimisticAction(updateLocationAction, {
	// 	currentState: { id: getLocationId(selectedLocationId, locations) },
	// 	updateFn: (_, input) => input,
	// 	onExecute: () => setOpen(false),
	// 	onError: (args) => {
	// 		setOpen(true)
	//
	// 		if (args.error.validationErrors) {
	// 			return toastError(formatErrors(args.error.validationErrors.fieldErrors))
	// 		}
	//
	// 		toastError()
	// 	},
	// })

	// const locationName = useMemo(() => {
	// 	return getLocationName(optimisticState.id, locations)
	// }, [optimisticState.id, locations])
	//
	// const handleLocationIdChange = (id: string | null) => {
	// 	execute({ id })
	// }

	return (
		<Dialog.Root
			open={open}
			onOpenChange={setOpen}
		>
			<Dialog.Trigger className="flex items-center gap-2 text-xs">
				{/*{isExecuting*/}
				{/*	? <Spinner size="sm"/>*/}
				{/*	: <Navigation className="size-3.5"/>*/}
				{/*}*/}

				{/*{locationName} <ChevronDown className="size-3.5 text-muted"/>*/}
			</Dialog.Trigger>

			<Dialog.Portal>
				<Dialog.Backdrop/>

				<Dialog.Popup>
					<Dialog.Close nativeClose/>
					<Dialog.Title>Населенный пункт</Dialog.Title>
					<Dialog.Description>Выберите ваш населенный пункт, чтобы увидеть точные условия доставки</Dialog.Description>

					{/*<HeaderLocationsSelect*/}
					{/*	locationId={optimisticState.id}*/}
					{/*	locations={locations}*/}
					{/*	onLocationIdChange={handleLocationIdChange}*/}
					{/*/>*/}
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	)
}