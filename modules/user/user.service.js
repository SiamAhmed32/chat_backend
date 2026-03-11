const generateToken = require("../../utils/generateToken");
const User = require("./user.model");

//register service
const registerUserService = async (userData) => {
  const { name, email, password, avatar } = userData;
  const userExists = await User.findOne({ email });

  //entered all thefields checking
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter All The Fields");
  }

  if (userExists) throw new Error("User ALready Exist!");
  const user = await User.create({ name, email, password, avatar });

  //returning the object
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
    avatar: user.avatar,
  };
};

//forgot password service
const forgotPasswordService = async(email)=>{
    
}

module.exports = { registerUserService };
