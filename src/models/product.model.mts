import type { Collection } from "mongodb";
import mongodb from "../database/index.mts";
import type { FindProductObj, Product, ProductCategory } from "./types.mts";

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

// product.model.mts
async function getRecommendedProducts(
  productId: string,
  category: ProductCategory,
): Promise<Product[]> {

  const collection = mongodb.getDb().collection<Product>("products")

  const sameCategoryProduct = await collection.find({id: {$ne: productId}, category}).limit(1).toArray()

  const chosenIds = [productId, ...sameCategoryProduct.map(p => p.id)];

  const differentCategoryProduct = await collection.find({
    id: {$nin: chosenIds}, 
    category: {$ne: category}
  }).limit(1).toArray()

  chosenIds.push(...differentCategoryProduct.map(p => p.id))

  const thirdProduct = await collection.find({
    id: {$nin: chosenIds}
  }).limit(1).toArray()

  return [...sameCategoryProduct, ...differentCategoryProduct, ...thirdProduct]

  // const collection = mongodb.getDb().collection<Product>("products");

  // const sameCategory = await collection
  //   .find({
  //     id: { $ne: productId },
  //     category,
  //   })
  //   .limit(1)
  //   .toArray();

  // const selectedIds = [productId, ...sameCategory.map((p) => p.id)];

  // const differentCategory = await collection
  //   .find({
  //     id: { $nin: selectedIds },
  //     category: { $ne: category },
  //   })
  //   .limit(1)
  //   .toArray();

  // selectedIds.push(...differentCategory.map((p) => p.id));

  // const thirdProduct = await collection
  //   .find({
  //     id: { $nin: selectedIds },
  //   })
  //   .limit(1)
  //   .toArray();

  // return [...sameCategory, ...differentCategory, ...thirdProduct];
}

export default {
  getAllProducts,
  getProductsById,
  getRecommendedProducts
};
