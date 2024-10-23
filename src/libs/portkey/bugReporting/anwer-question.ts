import { PortkeyRequest } from '../portkey-request';
// import { BugAgentRequestVariables } from '../types';

export class answerQuestionRequest extends PortkeyRequest {
  protected validateVariables(): void {
    // Todo:: comeback and do this
    // const variables = this.variables as BugAgentRequestVariables;

    // if (!('language_statement' in variables && 'message' in variables)) {
    //   throw new Error('Invalid variables for BugBuilderRequest');
    // }
  }
}