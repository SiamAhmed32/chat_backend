const express = require("express");
const {
  allUsers,
} = require("./user.controller.js");
const { protect } = require("../../middlewares/authMiddleware.js");
const { authUser, registerUser, forgotPassword } = require("./auth.controller.js");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);

//login route
router.post("/login", authUser);

//forgot password route
router.post("/forgotpassword", forgotPassword)

//
router.put("/resetpassword/:token", resetPassword);

module.exports = router;
