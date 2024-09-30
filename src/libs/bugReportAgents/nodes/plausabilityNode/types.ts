import { z, TypeOf } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const scoreFormat = z.object({
  score: z.number().describe("Between 1-10, 1 being the lest plauseable and 10 being very plauseable"),
  explanation: z.string().describe("An explanation of why this score was given."),
});

const PlausibilityResponseSchema = z.object({
  evaluation: z.object({
    lengthOfText: scoreFormat,
    structureAnalysis: scoreFormat,
    environmentInfo: scoreFormat,
    keywordPresence: scoreFormat,
    reasoning: scoreFormat,
    clarity: scoreFormat,
    specificity: scoreFormat,
    reproducibility: scoreFormat,
    relevance: scoreFormat,
    nextAsk: z.string().describe("A follow-up question to get additional info needed to properly evaluate the bug report with a focus on the lowest score."),
    overall_assessment: z.string().describe("An overall assessment of the bug report."),
  }),
});

const responseSchemaString = zodToJsonSchema(PlausibilityResponseSchema);

type PlausibilityResponse = TypeOf<typeof PlausibilityResponseSchema>;

export { PlausibilityResponseSchema, PlausibilityResponse, responseSchemaString };
