import { PortkeyRequest } from './portkey-request.js';
import { BugBuilderVariables } from './types.js';

export class BugBuilderRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugBuilderVariables;
    if (!('language_statement' in variables && 'observation' in variables)) {
      throw new Error('Invalid variables for BugBuilderRequest');
    }
  }
}