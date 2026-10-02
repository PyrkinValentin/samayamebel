import { z } from "@/libs/zod"
import { schema } from "@/shared/zod-schema"

export const updateLocationSchema = z.object({
	id: schema.uuid.nullable(),
})