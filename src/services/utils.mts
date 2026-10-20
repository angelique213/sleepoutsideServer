import type { Product, QueryParams } from "../models/types.mts";

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
  return v;
}
