import { z, TypeOf } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const scoreFormat = z.object({
  score: z.number().describe("Between 1-10, 1 being the lowest. The score is based on the data quality and evaluation."),
  explanation: z.string().describe("An explanation of why this score was given."),
});

const PlausibilityResponseSchema = z.object({
  evaluation: z.object({
    lengthOfTextScore: scoreFormat,
    structureAnalysisScore: scoreFormat,
    environmentInfoScore: scoreFormat,
    keywordPresenceScore: scoreFormat,
    reasoning: scoreFormat,
    nextAsk: z.string().describe("A follow-up question to get better information from the user based on the provided information."),
    overall_assessment: z.string().describe("An overall assessment of the bug report."),
  }),
});

const responseSchemaString = zodToJsonSchema(PlausibilityResponseSchema);

type PlausibilityResponse = TypeOf<typeof PlausibilityResponseSchema>;

export { PlausibilityResponseSchema, PlausibilityResponse, responseSchemaString };
