import { Router } from "express";
import productRoutes from "./product.routes.mts";
import userRoutes from "./user.routes.mts";
import swaggerRouter from "./swagger.routes.mts";
import checkoutRoutes from "./checkout.routes.mts";

const router: Router = Router();

// The home page route
router.get("/", (req, res) => {
  res.json({ title: "API V1" });
});

router.use("/products", productRoutes);
router.use("/users", userRoutes);
router.use("/checkout", checkoutRoutes);
router.use(swaggerRouter);

export default router;
