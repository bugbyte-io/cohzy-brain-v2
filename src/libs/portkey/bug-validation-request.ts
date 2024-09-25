import { PortkeyRequest } from './portkey-request.js';
import { BugValidationVariables } from './types.js';

export class BugValidationRequest extends PortkeyRequest {
  protected validateVariables(): void {
    const variables = this.variables as BugValidationVariables;
    if (!('language_statement' in variables && 'observation' in variables)) {
      throw new Error('Invalid variables for BugValidationRequest');
    }
  }
}