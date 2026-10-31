import argon2 from "argon2";
import type { User } from "../models/types.mts";
import userModel from "../models/user.model.mts";
import { generateToken, validator } from "./utils.mts";
import { UserSchema } from "../models/schemas.mts";

const login = async (email: string, password: string) => {
  // Check if the user exists in the database. the user will be providing an email as identifier...so we will need a function in the model to retrieve a user by email
  let user: User | null = null;
  let token = null;
  user = await userModel.getUserByEmail(email);
  // check to see if a user was found, ANd that the password provided matches the one returned from the database. Remember that the password in the database is hashed and salted...so we need to use argon2 to verify it "argon2.verify(password, passwordHash)"
  if (user) {
    const validPassword = await argon2.verify(user.passwordHash, password);
    if (validPassword) {
      token = await generateToken(user);
    }
  }
  // If the user exists and password matches...then generate a token using jsonwebtoken
  // Send back the token and some user info to the route either or both could be null.
  return {
    user,
    token,
  };
};

const createUser = async (
  email: string,
  password: string,
  name: string,
): Promise<boolean> => {
  const hashedPassword = await argon2.hash(password);
  const newUser: User = {
    email,
    passwordHash: hashedPassword,
    name,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  validator(UserSchema, newUser);
  const success = await userModel.createUser(newUser);
  if (!success) {
    return false;
  }
  return true;
};

export default { login, createUser };
