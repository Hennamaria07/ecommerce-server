import { Router } from "express";
import { DeleteUser, Logout, Profile, Sellers, SignIn, SignUp, UpdateProfile, ProfileById, Users, UpdatedUserRoleById, ForgotPassword, ResetPassword, SendMailToAdmin, latestSeller } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js"
import { authorizedAdmin, authorizedAdminOrSeller, verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = new Router();

router.route("/signup")
.post(upload.single('avatar'), SignUp);

router.route("/signin")
.post(SignIn);

router.route("/profile")
.get(verifyUser, Profile)
.put(verifyUser, upload.single('avatar'), UpdateProfile);

router.route("/logout")
.post(Logout);

router.route("/forgot-password")
.post(ForgotPassword);

router.route("/reset-password")
.patch(ResetPassword);

router.route("/become-seller").post(verifyUser, SendMailToAdmin)

router.route("/")
.get(verifyUser, authorizedAdmin , Users);

router.route("/seller/list")
.get(verifyUser, authorizedAdminOrSeller, Sellers);

// LATEST SELLERS
router.route("/latest/seller")
.get(verifyUser, authorizedAdmin, latestSeller)

//ADMIN ROUTES
router.route("/:id")
.delete(verifyUser, authorizedAdmin, DeleteUser)
.get(verifyUser, authorizedAdmin, ProfileById)
.patch(verifyUser, authorizedAdmin, UpdatedUserRoleById)



export default router