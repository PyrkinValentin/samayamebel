"use client"

import type { RefObject } from "react"

import { useEffect, useEffectEvent } from "react"

export const useResizeObserver = (ref: RefObject<HTMLElement | null>, handler: ResizeObserverCallback, options: ResizeObserverOptions = {}) => {
	const { box } = options

	const effectHandler = useEffectEvent(handler)

	useEffect(() => {
		const element = ref.current

		if (!element) return

		const options: ResizeObserverOptions = { box }

		const resizeObserver = new ResizeObserver(effectHandler)

		resizeObserver.observe(element, options)

		return () => resizeObserver.disconnect()
	}, [box, ref])
}