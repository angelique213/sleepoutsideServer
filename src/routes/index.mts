import { Router } from "express";
import productRoutes from "./product.routes.mts";
import swaggerRouter from "./swagger.routes.mts";

const router: Router = Router();

// The home page route
router.get("/", (req, res) => {
  res.json({ title: "API V1" });
});

router.use("/products", productRoutes);
router.use(swaggerRouter);

export default router;
