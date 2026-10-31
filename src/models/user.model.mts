import type { User } from "./types.mts";
import mongodb from "../database/index.mts";

async function getUserByEmail(email: string): Promise<User | null> {
  const user = await mongodb
    .getDb()
    .collection<User>("users")
    .findOne({ email });

  return user;
}

async function createUser(user: User): Promise<boolean> {
  const success = mongodb.getDb().collection<User>("users").insertOne(user);
  if (!success) {
    return false;
  }
  return true;
}

export default {
  getUserByEmail,
  createUser,
};
