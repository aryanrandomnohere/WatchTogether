import { z } from "zod";

const streamingIdSchema = z.object({
    id:z.number(),
    streamingId:z.string()
})

type StreamingIdSchema = z.infer<typeof streamingIdSchema>

export {streamingIdSchema,StreamingIdSchema}
