import { controllers, securityRules } from "./controllers";
import { env } from "./env";
import { Application } from "./_core/application";

const app = new Application()
  .pgOpts({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
  })
  .controllers(controllers)
  .securityRules(securityRules);

app.start(env.FASTIFY_PORT, env.FASTIFY_ADDRESS);
