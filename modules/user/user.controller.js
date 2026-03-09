const asyncHandler = require("express-async-handler");
const User = require("./user.model");
const generateToken = require("../../utils/generateToken");



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
  // const users = await User.find(keyword).find({
  //   _id: { $ne: req.user._id },
  // });

  // User.find({ role: 'admin', _id: { $ne: req.user._id } });

  const users = await User.find({ ...keyword, _id: { $ne: req.user._id } });

  res.json(users);
});

module.exports = { allUsers };
