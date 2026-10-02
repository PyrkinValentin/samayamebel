import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

export const useListenerSearchParam = (param: string, handler: () => void) => {
	const searchParams = useSearchParams()

	useEffect(() => {
		if (searchParams.has(param)) {
			const frameId = requestAnimationFrame(() => handler())

			return () => cancelAnimationFrame(frameId)
		}
	}, [handler, param, searchParams])
}