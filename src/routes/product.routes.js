import { Router } from "express";
import { authorizedAdmin, authorizedAdminOrSeller, authorizedSeller, verifyUser } from "../middlewares/verifyjwt.middleware.js";
import upload from "../middlewares/multer.middleware.js"
import { AdminDashboard, CreateProduct, DeleteProductById, FetchNewProduct, FetchProducts, FetchTopProduct, ProductById, ProductReview, ProductsBySeller, SellerDashboard, UpdateProductById } from "../controllers/product.controller.js";

const router = new Router();

router.route("/create")
.post(verifyUser, authorizedAdminOrSeller, upload.single("image"), CreateProduct);

router.route("/:id")
.get(ProductById)
.put(verifyUser, authorizedAdminOrSeller,upload.single("image"), UpdateProductById)
.delete(verifyUser, authorizedAdminOrSeller, DeleteProductById)

router.route("/fetch/products")
.post(FetchProducts);

router.route("/seller/products")
.get(verifyUser, authorizedSeller, ProductsBySeller);

router.route("/review/:id")
.post(verifyUser, ProductReview);

router.route("/top/products")
.get(FetchTopProduct);

router.route("/new/products")
.get(FetchNewProduct);

router.route("/admin/dashboard")
.get(verifyUser, authorizedAdmin, AdminDashboard);

router.route("/seller/dashboard")
.get(verifyUser, authorizedSeller, SellerDashboard);

export default router