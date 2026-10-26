import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

export function createAuth(d1: D1Database, secret?: string) {
  const db = drizzle(d1, { schema });
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification
      }
    }),
    secret: secret || "school-erp-super-secret-key-production-change-me",
    emailAndPassword: {
      enabled: true
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "student"
        },
        schoolId: {
          type: "string",
          required: false
        }
      }
    }
  });
}
