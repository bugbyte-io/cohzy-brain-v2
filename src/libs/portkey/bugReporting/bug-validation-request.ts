import { PortkeyRequest } from '../portkey-request.js';
import { BugAgentRequestVariables } from '../types.js';

export class BugValidationRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
  }
}