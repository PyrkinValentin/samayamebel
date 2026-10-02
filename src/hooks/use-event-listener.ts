"use client"

import { useEffect, useEffectEvent } from "react"

export const useEventListener = <K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => void, options: AddEventListenerOptions = {}) => {
	const { capture, once, passive } = options

	const effectListener = useEffectEvent(listener)
	const effectSignal = useEffectEvent(() => options.signal)

	useEffect(() => {
		const signal = effectSignal()

		const options: AddEventListenerOptions = {
			capture,
			once,
			passive,
			signal,
		}

		addEventListener(type, effectListener, options)

		return () => {
			removeEventListener(type, effectListener, options)
		}
	}, [capture, once, passive, type])
}