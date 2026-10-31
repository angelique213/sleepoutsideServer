import type { Product, QueryParams, User } from "../models/types.mts";
import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import addKeywords from "ajv-keywords";
import type { JSONSchema7 } from "json-schema";
import EntityNotFoundError from "../errors/EntityNotFoundError.mts";

export function formatFields(fields: string) {
  const fieldsArr = fields.split(",");
  const filter = fieldsArr
    .map((field: string) => field.trim())
    .reduce(
      (acc: Record<string, any>, current: string) => ({
        ...acc,
        [current]: 1,
      }),
      {},
    );
  console.log("formatFields:", filter);
  return filter;
}

// remember we created a QueryParams interface earlier in types.mts? Import it and use it here again
export function buildPaginationWrapper(totalCount: number, query: QueryParams) {
  // here we check to see if there is a limit...if yes convert it to a number, if no set it to the default of 20
  const limit = query.limit ? parseInt(query.limit) : 20;
  const offset = query.offset ? parseInt(query.offset) : 0;
  // assume you got 35 results back with a limit of 20, total pages would be 1.75. We can't have partial pages so Math.ceil would raise that to 2
  const totalPages = Math.ceil(totalCount / limit);
  // offset/limit would give us 0, then we add one so we are on the first page.
  const currentPage = Math.ceil(offset / limit) + 1;
  // in this case currentPage == 1 so hasPreviousPage would be false
  const hasPreviousPage = currentPage > 1;
  console.log(currentPage, totalPages);
  // currentPage < totalPages would be true. (1 < 2)
  const hasNextPage = currentPage < totalPages;
  let next, prev;
  // create a new URLSearchParams object from the query parameters. This will make it easy to modify the fields we need to, while passing all the others on.
  // This is a bit of a hack because we can't use the query object directly in our URLSearchParams constructor.
  const params = new URLSearchParams(query as Record<string, any>);
  if (hasPreviousPage) {
    params.set("offset", (offset - limit).toString());
    prev = `/?${params}`;
  }
  if (hasNextPage) {
    params.set("offset", (offset + limit).toString());
    next = `/?${params}`;
  }
  console.log("Query: " + JSON.stringify(query));
  return {
    count: totalCount,
    prev: prev || null,
    next: next || null,
    results: [] as any,
  };
}

export function sanitize(v: Record<string, any>) {
  if (typeof v === "object") {
    for (var key in v) {
      console.log(key, /^\$/.test(key));
      if (/^\$/.test(key)) {
        delete v[key];
      } else {
        sanitize(v[key]);
      }
    }
  }
  console.log(JSON.stringify(v));
  return v;
}

export async function generateToken(user: User): Promise<string> {
  const secretKey = (process.env.JWT_SECRET || "secret") as StringValue;
  const expires = (process.env.JWT_EXPIRES_IN || "10m") as StringValue;

  const userInfo = {
    email: user.email,
    _id: user._id,
  } as User;

  const token = jwt.sign(userInfo, secretKey, {
    expiresIn: expires,
  });

  return token;
}

export function validator(schema: JSONSchema7, data: Object) {
  // for some reason typescript doesn't like this even though it is exactly how the documentation says to use these. We are just going to ignore the types for now 🤷🏻‍♂️
  // @ts-ignore
  const ajv = new Ajv();
  // @ts-ignore
  addFormats(ajv);
  // @ts-ignore
  addKeywords(ajv, "instanceof");
  const validate = ajv.compile(schema);
  if (!validate(data)) {
    if (validate.errors) {
      // validate.errors is an array.  I've never seen more than one error come back...but just in case we can map over it and pull out the message(s)
      // We need to do this because our errorHandler is expecting a string...not an array of objects.
      const message = validate.errors
        .map((error: any) => error.instancePath + " " + error.message)
        .join(", ");
      throw new EntityNotFoundError({ message: message, statusCode: 400 });
    }
  }
}
