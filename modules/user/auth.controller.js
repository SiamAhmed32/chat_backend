const asyncHandler = require("express-async-handler");
const User = require("./user.model");
const generateToken = require("../../utils/generateToken");
const sendEmail = require("../../utils/sendEmails"); // Pointing to your utility
const crypto = require("crypto");

// @desc    Register a new user
// @route   POST /api/user
// @access  Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, avatar } = req.body;

  //entered all thefields checking
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All The Fields");
  }

  //checking if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User Already Exist");
  }

  //creating new user
  const user = await User.create({
    name,
    email,
    password,
    avatar,
  });
  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

// @desc    Auth the user & get token (Login)
// @route   POST /api/user/login
// @access  Public

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Forgot Password - Send Email
// @route   POST /api/user/forgotpassword
// @access  Public

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  const message = `<h1>Password Reset Request</h1>
  <p>Please click the link below to reset your password. This link is valid for 10 minutes only.</p>
  <a href="${resetUrl}"
  clicktracking=off>${resetUrl}</a>
  <p>If you did not request this, please ignore this email.</p>
  `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset Request",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Reset link sent to ${user.email}`,
    });
  } catch (error) {
    // If email fails, don't leave zombie data in the DB
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error("Email could not be sent. Please try again later.");
  }
});

// @desc    Reset Password (Actual Update)
// @route   PUT /api/user/resetpassword/:token
// @access  Public

const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired password reset token");
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password reset successful! You can now log in.",
  });
});

module.exports = { registerUser, authUser, forgotPassword, resetPassword };
