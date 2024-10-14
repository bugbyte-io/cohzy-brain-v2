export interface BugReportEval {
  previous_bug_report: boolean;
  bugReport: BugReport;
}

interface Files {
  url:string
}
export interface BugReport {
  bugType: string;
  expected: string;
  observed: string;
  replicationRate: string;
  replicationSteps: string[];
  shortDescription: string;
  files: Files[]
}