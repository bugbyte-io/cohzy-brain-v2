import { Portkey } from "portkey-ai";
import { BugOperationType, SpecificPromptVariables } from "./types.js";

/**
 * Base class for Portkey requests.
 */
export abstract class PortkeyRequest {
  protected variables: SpecificPromptVariables;
  protected promptType: BugOperationType;
  protected apiKey: string;

  constructor(variables: SpecificPromptVariables, promptType: BugOperationType) {
    this.apiKey = process.env.PORTKEY_API_KEY ?? "";
    this.variables = variables;
    this.promptType = promptType;
    this.validateVariables();
  }

  private getPromptId = (promptId: BugOperationType) => {
    switch (promptId) {
      case BugOperationType.BUG_PLAUSIBILITY:
        return process.env.PORTKEY_PROMPT_ID_BUG_PLAUSIBILITY_ID;
        break;
      case BugOperationType.BUG_BUILDER:
        return process.env.PORTKEY_PROMPT_ID_BUG_BUILDER_ID;
        break;
      case BugOperationType.BUG_VALIDATION:
        return process.env.PORTKEY_PROMPT_ID_BUG_VALIDATION_ID;
        break;
      default:
        throw new Error("Undefined bug operation type");
        break;
    }
  };

  /**
   * Validate the variables (to be implemented by subclasses).
   */
  protected abstract validateVariables(): void;

  /**
   * Make a PortKey request.
   */
  public async makeRequest() {
    const portkey = new Portkey({
      apiKey: this.apiKey,
    });

    const promptId = this.getPromptId(this.promptType)

    const promptCompletion = await portkey.prompts.completions.create({
      promptID: promptId,
      variables: this.variables,
    });

    return promptCompletion;
  }
}
