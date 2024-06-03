import { Router } from "express";
import {authorizedAdmin, authorizedSeller, verifyUser} from "../middlewares/verifyjwt.middleware.js"
import { CreateOrder, GetOrderBy, MarkAsDelivered, MarkAsPayed, Orders, SellerOrders, TotalCount, TotalSales, TotalSalesByDate, UserOrders } from "../controllers/order.controllers.js";

const router = new Router();

router.route("/create")
.post(verifyUser, CreateOrder);

router.route("/admin/orders-list")
.get(verifyUser, authorizedAdmin, Orders);

router.route("/user/orders-list")
.get(verifyUser, UserOrders);

router.route("/seller/orders-list")
.get(verifyUser, authorizedSeller, SellerOrders);

router.route("/total-count")
.get(verifyUser, authorizedAdmin, TotalCount);

router.route("/total-sales")
.get(verifyUser, authorizedAdmin, TotalSales);

router.route("/total-sales-date")
.get(verifyUser, authorizedAdmin, TotalSalesByDate);

router.route("/:id")
.get(verifyUser, GetOrderBy);

router.route("/:id/pay")
.patch(verifyUser, MarkAsPayed);

router.route("/:id/delivered")
.patch(verifyUser, authorizedAdmin, MarkAsDelivered);

export default router