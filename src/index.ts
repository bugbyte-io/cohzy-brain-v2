import Fastify from 'fastify';
import healthcheck from './plugins/healthcheck.js';

const server = Fastify();

server.register(healthcheck);

// Specify the port as a number
server.listen({port: 3030}, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});