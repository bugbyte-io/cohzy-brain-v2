import { PortkeyRequest } from '../portkey-request';
import { BugAgentRequestVariables } from '../types';

export class BugBuilderRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugAgentRequestVariables;
  }
}