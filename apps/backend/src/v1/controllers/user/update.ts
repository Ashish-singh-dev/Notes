import { eq } from "drizzle-orm";
import { Context } from "elysia";
import { User } from "lucia";

import { db } from "@/db";
import { userTable } from "@/db/schema/user";
import type { UserResponse, UserUpdateSchema } from "@/v1/validations/user";

interface UpdateUserProps extends Context {
  user: User;
  body: UserUpdateSchema;
}

export async function updateUser({ user, error, body }: UpdateUserProps) {
  try {
    const [updatedUser] = await db
      .update(userTable)
      .set(body)
      .where(eq(userTable.id, user.id))
      .returning();

    if (!updatedUser) {
      return error(400, "Failed to update user");
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      photoURL: updatedUser.photoURL,
      displayName: updatedUser.displayName,
      emailVerified: updatedUser.emailVerified
    } satisfies UserResponse;
  } catch (err) {
    return error(500, "Internal Server Error");
  }
}
