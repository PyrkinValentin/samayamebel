import { NODE_ENV } from "./node"

export const LOCATION_COOKIE_NAME = "location_id"

export const LOCATION_COOKIE_OPTIONS = {
	maxAge: 60 * 60 * 24 * 30,
	path: "/",
	sameSite: "lax" as const,
	httpOnly: true,
	secure: NODE_ENV === "production"
}