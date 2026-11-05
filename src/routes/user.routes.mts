import { Router } from "express";
import userService from "../services/user.service.mts";
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";
import type { QueryParams, User } from "../models/types.mts";
import { sanitize } from "../services/utils.mts";
import authorize from "../middleware/authorize.middleware.mts";
const router: Router = Router();

router.get("/protected", authorize, (req, res) => {
  console.log(res.locals.user);
  const messageObj = { message: `Hello, ${res.locals.user.email}` };
  res.json(messageObj);
});

router.post("/login", async (req, res, next) => {
  try {
    console.log("hitting login route");
    const email = sanitize(req.body.email);
    const password = sanitize(req.body.password);
    // call the service function, pass in the email and password.
    // the service function should return a valid user and token  or null for either
    const loginResult = await userService.login(email, password);

    // forward a 401 error if either is null
    if (!loginResult.user || !loginResult.token) {
      return next(
        new EntityNotFoundError({
          message: "Authentication failed",
          code: "ERR_VALID",
          statusCode: 401,
        }),
      );
    }
    // if both values exist, Send back the token and some user info in the response
    const tokenObject = {
      user: {
        _id: loginResult.user._id,
        email: loginResult.user.email,
        name: loginResult.user.name,
      },
      token: loginResult.token,
    };
    res.status(200).json(tokenObject);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const email = sanitize(req.body.email).email;
    const password = sanitize(req.body.password).password;
    const name = sanitize(req.body.name).name;
    const success = await userService.createUser(email, password, name);
    if (success) {
      res.status(200);
    } else {
      res.status(500);
    }
  } catch (error) {
    next(error);
  }
});

export default router;
