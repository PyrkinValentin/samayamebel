"use client"

import type { ReactNode } from "react"

import { useMediaQuery } from "@cora-ui/react/hooks"

import { Toast } from "@cora-ui/react"

type ToasterProps = {
	children: ReactNode
}

type ToastListProps = {
	swipeDirection: ToastSwipeDirection[]
}

type ToastSwipeDirection = "right" | "up" | "left" | "down"

const TOAST_DESKTOP_SWIPE_DIRECTION: ToastSwipeDirection[] = ["up"]
const TOAST_MOBILE_SWIPE_DIRECTION: ToastSwipeDirection[] = ["up", "left", "right"]

export const toastManager = Toast.createManager()

export const Toaster = (props: ToasterProps) => {
	const { children } = props

	const desktop = useMediaQuery((query) => query.up("sm"))

	const swipeDirection = desktop
		? TOAST_DESKTOP_SWIPE_DIRECTION
		: TOAST_MOBILE_SWIPE_DIRECTION

	return (
		<Toast.Provider toastManager={toastManager}>
			{children}

			<Toast.Portal>
				<Toast.Viewport position="top-center">
					<ToastList swipeDirection={swipeDirection}/>
				</Toast.Viewport>
			</Toast.Portal>
		</Toast.Provider>
	)
}

const ToastList = (props: ToastListProps) => {
	const { swipeDirection } = props

	const { toasts } = Toast.useManager()

	return toasts.map((toast) => (
		<Toast.Root
			key={toast.id}
			toast={toast}
			swipeDirection={swipeDirection}
		>
			<Toast.Indicator/>

			<Toast.Content>
				<Toast.Title/>
				<Toast.Description/>
			</Toast.Content>

			<Toast.Action/>
			<Toast.Close/>
		</Toast.Root>
	))
}