const generateToken = require("../../utils/generateToken");
const sendEmail = require("../../utils/sendEmail");
const User = require("./user.model");
const crypto = require('crypto')

//register service
const registerUserService = async (userData) => {
  const { name, email, password, avatar } = userData;
  const userExists = await User.findOne({ email });

  //entered all thefields checking
  if (!name || !email || !password) {
    
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
const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("!User with this email doesn't exist");
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //reset url & message
  const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;
  const message = `<h1>Password Reset</h1>
    <p>Reset Link: <a href=${resetUrl}>${resetUrl}</a></p>
    <p>If you did not request this, please ignore this email.</p>
    `;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      message,
    });
    return {
      success: true,
      message: `Reset link sent successfully to ${user.email}`,
    };
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error("Email could not be sent. Please try again");
  }
};

//reset password service
const resetPasswordService = async(token, newPassword)=>{
  const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")
  
  //finding the user from resetPasswordToken
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{$gt:Date.now()}
  })

  if(!user) throw new Error("Invalid or expired password reset token")

    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()
    return { success: true, message: "Password reset successful!" };



}

module.exports = { registerUserService, forgotPasswordService, resetPasswordService };
