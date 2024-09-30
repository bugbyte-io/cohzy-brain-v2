import { PortkeyRequest } from '../portkey-request';
import { BugAgentRequestVariables } from '../types';

export class BugEntryRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
    if (!('message' in variables)) {
      throw new Error('Invalid variables for BugBuilderRequest');
    }
  }
}