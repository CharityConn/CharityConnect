import type {Config} from 'drizzle-kit';

export default {
  schema: './src/domain/schemas/*.ts',
  out: './drizzle',
} as Config;
