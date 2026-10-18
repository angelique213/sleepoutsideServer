// import MongoClient and ServerApiVersion from the mongodb library and import products from the products.js file.
import { MongoClient } from "mongodb";
import { ServerApiVersion } from "mongodb";
import { products } from "./products.js";
import * as argon2 from "argon2";

//build the uri for our connection string

const uri = process.env.MONGO_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//define the init function to connect to our database and create collections
const init = async () => {
  try {
    await client.connect();
    console.log(`Connected to MongoDB`);
    // get a reference to the actual database we will be using with .db(<database name>)
    const db = client.db(process.env.MONGO_DATABASE);
    // initialize the Products collection
    await seedProducts(db);
    await seedUsers(db);
    await seedOrders(db);
    await seedAlerts(db);
  } catch (error) {
    console.error(error.message);
  } finally {
    await client.close();
  }
};

const lowerCaseKeys = function (obj) {
  // if it is an object, but NOT an array, then we need to iterate through all of its keys
  if (typeof obj === "object" && !Array.isArray(obj)) {
    for (let key in obj) {
      // take the first letter (key[0]) of the key and make it lowercase
      // then add that to the rest of the key after REMOVING the first letter (key.slice(1))
      let newKey = key[0].toLowerCase() + key.slice(1);
      // if the value of this key is an object, then we need to call this function again
      if (typeof obj[key] === "object") {
        obj[newKey] = lowerCaseKeys(obj[key]);
        delete obj[key];
      } else {
        obj[newKey] = obj[key];
        delete obj[key];
      }
    }
  } else if (Array.isArray(obj)) {
    // if it is an array, then we need to iterate through each item in the array
    // and for each object value call the function again.
    for (let i = 0; i < obj.length; i++) {
      let item = obj[i];
      if (typeof item === "object") {
        obj[i] = lowerCaseKeys(item);
      }
    }
  }
  return obj;
};

const seedProducts = async (db) => {
  // we need to make a small transform to the provided data before inserting
  // use .map() to transform each product before inserting it into the database
  // change Reviews.ReviewUrl to match the following pattern: /products/<productId>/reviews/
  const updatedProducts = products.map((product) => {
    product.Reviews.ReviewsUrl = `/products/${product.Id}/reviews/`;
    product = lowerCaseKeys(product);

    return product;
  });
  // while we are at it...the data provided used a PascalCase naming convention for its keys. Use the provided lowerCaseKeys function to convert all keys to camelCase. This will make it consistent with the rest of our models.

  try {
    // drop the collection to clear out the old records
    const existProducts = db.collection("products");

    try {
      await existProducts.drop();
    } catch (error) {
      console.error(error.message);
    }

    console.log("Collection 'products' dropped successfully");

    // create a new collection
    const products = await db.createCollection("products");

    products.createIndex({ name: 1 });
    products.createIndex({ description: 1 });
    products.createIndex({ category: 1 });
    products.createIndex({ id: 1 });

    // insert all products
    const productResult = await products.insertMany(updatedProducts);

    console.log(
      `${productResult.insertedCount} new listing(s) created with the following id(s):`,
    );
    console.log(productResult.insertedIds);
  } catch (error) {
    console.error(error.message);
  }
};

const seedUsers = async (db) => {
  const existUsers = db.collection("users");
  try {
    await existUsers.drop();
  } catch (error) {
    console.error(error);
  }

  const users = await db.createCollection("users");
  users.createIndex({ firstName: 1, lastName: 1 });
  users.createIndex({ email: 1 });
  users.createIndex({ _id: 1 });

  const hashedPassword = await argon2.hash("password");

  // insert test user
  try {
    const userResult = await users.insertOne({
      firstName: "Team",
      lastName: "Three",
      email: "team3@byui.edu",
      passwordHash: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`${userResult.acknowledged} new users added with email(s): `);
    console.log(userResult.insertedId);
  } catch (error) {
    console.error(error.message);
  }
};

const seedAlerts = async (db) => {
  const existAlerts = db.collection("alerts");

  try {
    await existAlerts.drop();
  } catch (error) {
    console.error(error);
  }

  const alerts = await db.createCollection("alerts");
};

const seedOrders = async (db) => {
  const existOrders = db.collection("orders");

  try {
    await existOrders.drop();
  } catch (error) {
    console.error(error);
  }

  const orders = await db.createCollection("orders");
};

init();
