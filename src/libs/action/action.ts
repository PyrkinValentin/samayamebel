import { createSafeActionClient, flattenValidationErrors } from "next-safe-action"

export const actionClient = createSafeActionClient({
	defaultValidationErrorsShape: "flattened",
})