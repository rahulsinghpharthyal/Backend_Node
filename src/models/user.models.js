import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // we use cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // we use cloudinary url
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      requied: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// for bcrypt the password:-
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// for encrypt the password:- used Method to match the password when user try to login:-
userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password);
};

//to generate the access_token
userSchema.methods.generateAccessToken = function(){
 return jwt.sign({_id: this._id}, process.env.JWT_ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_ACCESS_TOKEN_SECRET_EXPIRY})
};

//to generate the refresh_token
userSchema.methods.generateRefreshToken = function(){ 
  return jwt.sign({_id: this._id}, process.env.JWT_REFRESH_TOKEN_SECRET, {expiresIn: process.env.JWT_REFRESH_TOKEN_SECRET_EXPIRY})
};

const User = mongoose.model("User", userSchema);

export default User;
