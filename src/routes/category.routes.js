import { Router } from "express";
import { authorizedAdmin, authorizedAdminOrSeller, verifyUser } from "../middlewares/verifyjwt.middleware.js";
import { Categories, CategoryById, CreateCategory, DeleteCategory, UpdateCategory } from "../controllers/category.controllers.js";

const router = new Router();

router.route("/create")
.post(verifyUser, authorizedAdminOrSeller, CreateCategory);

router.route("/categories")
.get(Categories);

router.route("/:id")
.get(CategoryById)
.put(verifyUser, authorizedAdminOrSeller, UpdateCategory)
.delete(verifyUser, authorizedAdminOrSeller, DeleteCategory);

export default router