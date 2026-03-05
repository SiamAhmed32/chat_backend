const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../utilis/generateToken");

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

// @desc    Get or Search all users
// @route   GET /api/user?search=piash
// @access  Public (Wait? Should this be private? Yes! Only logged in users should search)

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
      $or: [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ],
    }
    : {};

  // Find all users matching keyword, but EXCLUDE the currently logged in user
  const users = await User.find(keyword).find({
    _id: { $ne: req.user._id },
  });
  res.json(users);
});

module.exports = { registerUser, authUser, allUsers };
