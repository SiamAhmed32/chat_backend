const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require('crypto')

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    // newly entered or updated then isModified get's true -> !true = false
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//this function generates a random token and hasshes it
userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(10).toString('hex')
    
}

const User = mongoose.model("User", userSchema);


module.exports = User;


