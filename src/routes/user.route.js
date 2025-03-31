import { Router } from "express";
import {
  changeUserPassword,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserAccount,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import isAuthenticate from "../middlewares/isAuthenticate.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured Routes
router.route("/logout").post(isAuthenticate, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/chagne-password").post(isAuthenticate, changeUserPassword);
router.route("/update-account").patch(isAuthenticate, updateUserAccount);
router
  .route("/avatar")
  .patch(isAuthenticate, upload.single("avatar"), updateUserAvatar);
router
  .route("/avatar")
  .patch(isAuthenticate, upload.single("coverImage"), updateUserCoverImage);
router
  .route("/channel-profile/:username")
  .get(isAuthenticate, getUserChannelProfile);
router.route("/watch-history").get(isAuthenticate, getWatchHistory);
export default router;
