import { PortkeyRequest } from './portkey-request.js';
import { BugPlausibilityVariables } from './types.js';

export class BugPlausibilityRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugPlausibilityVariables;
    if (!('language_statement' in variables && 'observation' in variables)) {
      throw new Error('Invalid variables for BugPlausibilityRequest');
    }
  }
}