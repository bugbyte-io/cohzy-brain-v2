import { z } from "zod";
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
} from "@langchain/core/messages";

const message = z.object({
  role: z.enum(['AiMessage', 'HumanMessage']),
  content: z.string(),
  display: z.boolean(),
  bugBuildCompleted: z.boolean()
})
const messageArray = z.array(message);

const ChatDataSchema = z.object({
  userId: z.string(),
  traceId: z.string(),
  messages: messageArray,
  language: z.string(),
  origin: z.string().optional(),
  validationPass: z.boolean(),
  plausabilityPass: z.boolean(),
  bugBuildCompleted: z.boolean()
});

type ChatData = z.infer<typeof ChatDataSchema>;



export { ChatData, ChatDataSchema };
