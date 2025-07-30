import { defineConfig } from '@mikro-orm/postgresql';
import { History } from './entities/History';
import * as dotenv from 'dotenv';

dotenv.config();


export default defineConfig({
  entities: [History],
  clientUrl: process.env.DATABASE_URL,
  schema: 'public',
  migrations: {
    path: './src/migrations',
  },
});