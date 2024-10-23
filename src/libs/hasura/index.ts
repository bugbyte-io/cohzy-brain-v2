import { BugReportEval } from "@libs/bugReportAgents/types";



const gqlMsg = `mutation SaveBugReport($expected: String, $files: jsonb, $game_id: uuid, $images: jsonb, $impact: Int, $observed: String, $replication_rate: Int, $short_description: String, $status: Int, $steps: json, $user_id: uuid, $type_code: Int, $discord_thread_id: String ) {
  insert_bug_reports_one(object: {expected: $expected, files: $files, game_id: $game_id, images: $images, impact: $impact, observed: $observed, replication_rate: $replication_rate, short_description: $short_description, status: $status, steps: $steps, user_id: $user_id, type_code: $type_code, discord_thread_id: $discord_thread_id}) {
    id
    bug_id
  }
}
`

const userQuery = `query getUser($id: uuid = "") {
  users_by_pk(id: $id) {
    user_name
  }
}`




export const createBugReport = async (state: BugReportEval, gameId: string, discordThreadId: string, userId: string) => {

  const url = process.env.HASURA_GRAPHQL_ENDPOINT ?? "";
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("x-hasura-admin-secret", process.env.HASURA_ADMIN_SECRET ?? '');

  const variables = {
    expected: state.bugReport.expected,
    files: state.bugReport.files,
    type_code: 1,
    replication_rate: 1,
    steps: state.bugReport.replicationSteps,
    short_description: state.bugReport.shortDescription,
    observed: state.bugReport.observed,
    game_id: gameId,
    user_id: userId,
    discord_thread_id: discordThreadId,
    images: [],
    impact: 1,
    status: 1
  }

  const response = await fetch(url, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      query: gqlMsg,
      variables
    }),
  });
  const data = await response.json();

  return data
};


export const getUserById = async (userId: string) => {

  const url = process.env.HASURA_GRAPHQL_ENDPOINT ?? "";
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("x-hasura-admin-secret", process.env.HASURA_ADMIN_SECRET ?? '');

  const variables = {id: userId}
  const response = await fetch(url, {
    method: "POST",
    headers: requestHeaders,
    body: JSON.stringify({
      query: userQuery,
      variables
    }),
  });

  const data = await response.json();
  
  return data
}