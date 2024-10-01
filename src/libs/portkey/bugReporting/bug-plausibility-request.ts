import { PortkeyRequest } from '../portkey-request';
import { BugAgentRequestVariables } from '../types';

export class BugPlausibilityRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
    if (!('useLang' in variables && 'messages' in variables)) {
      throw new Error('Invalid variables for BugPlausibilityRequest');
    }
  }
}