import { db } from "@repo/db";

type GoogleProfile = {
  googleId: string;
  email: string;
  name: string | undefined;
};

export async function findOrCreateUser(input: GoogleProfile) {
  const find = () =>
    db.orm.public.User.where({ googleId: input.googleId }).all().first();

  const existing = await find();
  if (existing) return existing;

  try {
    return await db.orm.public.User.create({
      email: input.email,
      googleId: input.googleId
    });
  } catch (err) {
    // two first-time logins at the same moment: the other request won
    const created = await find();
    if (created) return created;
    throw err;
  }
}