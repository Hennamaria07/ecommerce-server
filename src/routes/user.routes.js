import { Router } from "express";
import { DeleteUser, Logout, Profile, Sellers, SignIn, SignUp, UpdateProfile, ProfileById, Users, UpdatedUserRoleById } from "../controllers/user.controllers.js";
import upload from "../middlewares/multer.middleware.js"
import { authorizedAdmin, verifyUser } from "../middlewares/verifyjwt.middleware.js";

const router = new Router();

router.route("/signup")
.post(upload.single('avatar'), SignUp);

router.route("/signin")
.post(SignIn);

router.route("/profile")
.get(verifyUser, Profile)
.put(verifyUser, upload.single('avatar'), UpdateProfile);

router.route("/logout")
.post(verifyUser, Logout);

router.route("/")
.get(verifyUser, authorizedAdmin , Users);

router.route("/seller/list")
.get(verifyUser, authorizedAdmin, Sellers);

//ADMIN ROUTES
router.route("/:id")
.delete(verifyUser, authorizedAdmin, DeleteUser)
.get(verifyUser, authorizedAdmin, ProfileById)
.patch(verifyUser, authorizedAdmin, UpdatedUserRoleById)

export default router