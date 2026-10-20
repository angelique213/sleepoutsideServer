import productModel from "../models/product.model.mts";
import type {
  FindProductObj,
  QueryParams,
  ProductCategory,
} from "../models/types.mts";
import { buildPaginationWrapper, formatFields, sanitize } from "./utils.mts";

const validCategories = [
  "tents",
  "backpacks",
  "sleeping-bags",
  "hammocks",
] as const;

const getAllProducts = async (query: QueryParams) => {
  const cleanQuery = sanitize(query);
  const limit =
    cleanQuery.limit && Number.isFinite(cleanQuery.limit)
      ? +cleanQuery.limit
      : 20;
  const offset =
    cleanQuery.offset && Number.isFinite(+cleanQuery.offset)
      ? +cleanQuery.offset
      : 0;

  const { q, fields, category } = cleanQuery;
  let findProduct: FindProductObj = {
    search: {},
    limit,
    offset,
  };
  findProduct.fieldFilters = fields ? formatFields(fields) : undefined;
  if (q) {
    findProduct.search.name = q;
    findProduct.search.descriptionHtmlSimple = q;
  }
  if (category && isProductCategory(category)) {
    findProduct.search.category = category;
  }
  const productsResults = await productModel.getAllProducts(findProduct);
  const paginationResults = buildPaginationWrapper(
    productsResults.productsCount,
    cleanQuery,
  );
  paginationResults.results = productsResults.productsResults;
  return paginationResults;
};

function isProductCategory(value: string): value is ProductCategory {
  return (validCategories as readonly string[]).includes(value);
}

const getProductsById = async (id: string) => {
  return await productModel.getProductsById(id);
};

export default {
  getAllProducts,
  getProductsById,
};
