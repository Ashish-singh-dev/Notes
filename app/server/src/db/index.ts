import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  emailVerificationCodeTable,
  sessionTable,
  userTable
} from "./schema/user";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, {
  schema: { ...userTable, ...sessionTable, ...emailVerificationCodeTable }
});

export type DB = typeof db;
