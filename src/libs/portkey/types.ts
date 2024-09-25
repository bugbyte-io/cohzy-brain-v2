/**
 * Specific types for each promptId.
 */
export type BugValidationVariables = {
  language_statement: string;
  observation: string;
};

export type BugPlausibilityVariables = {
  language_statement: string;
  observation: string;
};

export type BugBuilderVariables = {
  language_statement: string;
  observation: string;
};

/**
 * Union of all specific variable types.
 */
export type SpecificPromptVariables = BugValidationVariables | BugPlausibilityVariables | BugBuilderVariables;

/**
 * Enum for different types of bug-related operations.
 */
export enum BugOperationType {
  BUG_VALIDATION = "BUG_VALIDATION",
  BUG_PLAUSIBILITY = "BUG_PLAUSIBILITY",
  BUG_BUILDER = "BUG_BUILDER",
}