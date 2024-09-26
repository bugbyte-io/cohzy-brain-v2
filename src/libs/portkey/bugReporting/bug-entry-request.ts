import { PortkeyRequest } from '../portkey-request.js';
import { BugAgentRequestVariables } from '../types.js';

export class BugEntryRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
    if (!('message' in variables)) {
      throw new Error('Invalid variables for BugBuilderRequest');
    }
  }
}