import { Router } from "express";
import { upload } from "../utils/multerConfig.js";
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  updateCategoryHandler,
} from "../handler/user/categoryHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const categoryRouter = Router();

categoryRouter.post(
  "/add",
  authMiddleware,
  upload.single("image"),
  createCategoryHandler
);
categoryRouter.get("/get", authMiddleware, getCategoryHandler);
categoryRouter.delete("/delete/:id", authMiddleware, deleteCategoryHandler);
categoryRouter.put("/update/:id", authMiddleware, upload.single("image"), updateCategoryHandler);

export { categoryRouter };
