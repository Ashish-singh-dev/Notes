import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as noteSchema from "./schema/note";
import * as userSchema from "./schema/user";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, {
  schema: {
    ...userSchema,
    ...noteSchema
  }
});

export type DB = typeof db;
