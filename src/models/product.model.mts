import type { Collection } from "mongodb";
import mongodb from "../database/index.mts";
import type { FindProductObj, Product } from "./types.mts";

async function getAllProducts(findProduct: FindProductObj) {
  const productsCollection: Collection<Product> = mongodb
    .getDb()
    .collection("products");
  const productsCount = await productsCollection.countDocuments(
    findProduct.search,
  );
  const productsCursor = await productsCollection
    .find(findProduct.search)
    .skip(findProduct.offset)
    .limit(findProduct.limit);
  if (findProduct.fieldFilters) {
    productsCursor.filter(findProduct.fieldFilters);
  }
  const productsResults = await productsCursor.toArray();
  console.log(productsResults, productsCount);
  console.log(findProduct);

  return { productsResults, productsCount };
}

async function getProductsById(id: string): Promise<Product | null> {
  const product = await mongodb
    .getDb()
    .collection<Product>("products")
    .findOne({ id: id });
  return product;
}

export default {
  getAllProducts,
  getProductsById,
};
