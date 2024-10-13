import Fastify from "fastify";
import healthcheck from "./plugins/healthcheck.js";
import bugReportingPlugin from "./plugins/bugReporting/createBugReport.js";

import cors from "@fastify/cors";
import dotenv from "dotenv";
import {
  fetchStateHandler,
  registerAdAiMessageRoute,
  registerCreateBugReportRoute,
} from "plugins/bugReporting/index.js";

// Load environment variables
dotenv.config();
const server = Fastify({
  logger: {
    level: "info",
  },
});

server.register(healthcheck);
server.register(bugReportingPlugin);
server.register(fetchStateHandler);

registerCreateBugReportRoute(server);
registerAdAiMessageRoute(server);

// Allow CORS requests from localhost:3000
await server.register(cors, {
  origin: true,
});

// Specify the port as a number
server.listen({ port: 3030 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
