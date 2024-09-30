import { PortkeyRequest } from '../portkey-request';
import { BugAgentRequestVariables } from '../types';

export class BugPlausibilityRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
    if (!('language_statement' in variables && 'message' in variables)) {
      throw new Error('Invalid variables for BugPlausibilityRequest');
    }
  }
}