import { Router } from "express";
import multer from "multer";
import authorize from "../middleware/authorize.middleware.mts";
import { sanitize } from "../services/utils.mts";

const router: Router = Router();
const parseForm = multer();

router.post("/", authorize, parseForm.none(), async (req, res, next) => {
  try {
    const formData = sanitize(req.body);
    console.log(formData);
    res.status(200).json();
  } catch (error) {
    next(error);
  }
});

export default router;
