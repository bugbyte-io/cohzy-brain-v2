import { z, TypeOf } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";


const BugBuilderResponseSchema = z.object({
  evaluation: z.object({
    bugType: z.enum(["Visual", "Audio", "Game Play"]),
    expected: z
      .string()
      .describe(
        "A statement outlining the outcome or behavior the user anticipated when interacting with the game. This section describes the user's assumptions about how a particular feature, function, or scenario should have worked as intended."
      ),
    observed: z
      .string()
      .describe(
        "A detailed recount of the user’s experience, capturing what occurred in the game. This section should not only describe the actual behavior and outcomes but also preserve the user's unique writing style, tone, and phrasing. Any additional details provided by the user, such as steps taken or contextual observations, should be reflected in their own words to maintain authenticity."
      ),
    replicationRate: z
      .enum(["Unknown", "Never", "Sometimes", "Everytime"])
      .describe(
        "How often a user is able to replicate the bug based on the provided context"
      ),
    replicationSteps: z
      .string()
      .array()
      .describe(
        "A collection of steps to replicate the bug based on using the provided context."
      ),
    shortDescription: z
      .string()
      .describe(
        "A clear, one-line summary of the bug that succinctly identifies the problem. This acts as the title for the report, helping developers quickly understand the nature of the issue before diving into the full details."
      ),
  }),
});

const bugSchemaString = zodToJsonSchema(BugBuilderResponseSchema);

type bugBuilderResponse = TypeOf<typeof BugBuilderResponseSchema>;

export { BugBuilderResponseSchema, bugBuilderResponse, bugSchemaString };
