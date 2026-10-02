import type { HeaderData } from "./queries"

import { HeaderLocations } from "./header-locations"
import { HeaderLayout } from "./header-layout"

export const Header = (props: HeaderData) => {
	const { selectedLocationId, locations } = props

	return (
		<>
			<div className="w-full bg-neutral hidden sm:block">
				<div className="mx-auto px-4 py-2 max-w-7xl flex items-center">
					<HeaderLocations
						selectedLocationId={selectedLocationId}
						locations={locations}
					/>

					<div className="ms-auto flex items-center gap-4">
						Остальное
					</div>
				</div>
			</div>

			<HeaderLayout>
				Hello
			</HeaderLayout>
		</>
	)
}