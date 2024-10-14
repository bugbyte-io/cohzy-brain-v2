export interface BugReportEval {
  previous_bug_report: boolean;
  bugReport: BugReport;
}

interface BugReport {
  bugType: string;
  expected: string;
  observed: string;
  replicationRate: string;
  replicationSteps: string[];
  shortDescription: string;
}