"use client"

import type { Dispatch, RefObject, SetStateAction } from "react"

import { useEffect, useState, useRef } from "react"
import { useMediaQuery } from "@cora-ui/react/hooks"
import { useEventListener, useResizeObserver, useSearchParamEffect } from "@/hooks"

import { AUTH_REDIRECT_PARAM } from "@/constants/auth"

type ScrollDirectionState = {
	visible: boolean
	pinned: boolean
}

export const useElementHeight = (ref: RefObject<HTMLElement | null>, initialHeight: number = 0): number => {
	const [height, setHeight] = useState(initialHeight)

	useResizeObserver(ref, ([entry]) => {
		if (entry) {
			const currentHeight =
				entry.borderBoxSize?.[0]?.blockSize ??
				entry.target.getBoundingClientRect().height

			setHeight(Math.round(currentHeight))
		}
	})

	return height
}

export const useScrollDirectionState = (headerHeight: number, scrollThreshold: number): ScrollDirectionState => {
	const lastScrollY = useRef(0)
	const visibleRef = useRef(true)
	const pinnedRef = useRef(false)

	const [visible, setVisible] = useState(true)
	const [pinned, setPinned] = useState(false)

	const mobile = useMediaQuery((query) => query.down("sm"))

	const updateVisible = (next: boolean) => {
		if (visibleRef.current !== next) {
			visibleRef.current = next

			setVisible(next)
		}
	}

	const updatePinned = (next: boolean) => {
		if (pinnedRef.current !== next) {
			pinnedRef.current = next

			setPinned(next)
		}
	}

	const tickingRef = useRef(false)

	const handleScrollOrResize = () => {
		if (tickingRef.current) return

		tickingRef.current = true

		requestAnimationFrame(() => {
			updatePinned(scrollY > 0)

			if (!mobile) {
				updateVisible(true)

				lastScrollY.current = scrollY
				tickingRef.current = false

				return
			}

			if (scrollY <= 0) {
				updateVisible(true)

				lastScrollY.current = 0
				tickingRef.current = false

				return
			}

			const scrolledPastHeader = scrollY > headerHeight
			const scrollDiff = Math.abs(scrollY - lastScrollY.current)

			if (scrollDiff < scrollThreshold) {
				tickingRef.current = false

				return
			}

			if (scrollY > lastScrollY.current) {
				if (scrolledPastHeader) {
					updateVisible(false)
				}
			} else {
				updateVisible(true)
			}

			lastScrollY.current = scrollY
			tickingRef.current = false
		})
	}

	useEventListener("scroll", handleScrollOrResize, { passive: true })
	useEventListener("resize", handleScrollOrResize, { passive: true })

	useEffect(() => {
		updatePinned(scrollY > 0)

		lastScrollY.current = scrollY
	}, [])

	return { visible, pinned }
}

export const useUrlTriggeredDialog = (): [boolean, Dispatch<SetStateAction<boolean>>] => {
	const [open, setOpen] = useState(false)

	useSearchParamEffect(AUTH_REDIRECT_PARAM, () => {
		const frameId = requestAnimationFrame(() => setOpen(true))

		return () => {
			cancelAnimationFrame(frameId)
		}
	})

	return [open, setOpen]
}