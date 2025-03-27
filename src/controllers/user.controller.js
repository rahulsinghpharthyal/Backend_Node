import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from 'jsonwebtoken';
import { options } from "../constants.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // if we use save method so we need all required filed again in this case we have no any password we only save teh refreshtoken so that's why we are using the validateBeforeSave
    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError("Something went wrong while generating access and refresh token",500);
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  // get user details from frontend:-
  // validation:-
  // check if user already registerd:- with email as your requirement
  // check for images, check for avatar:-
  // upload them to cloudinary:-
  // check uploaded succesfull in cloudinary:-
  // save the cloudinary link to database:-
  // create a user object:- create entry in db
  // remove password and refresh token fields from response
  // check the response is available then return the response

  const { username, email, password, fullName } = req.body;
  console.log("this is body", req.body);
  console.log("req.files:", req.files);

  if (!fullName || !email || !password || !username)
    throw new ApiError("all fields are required", 400);
  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw new ApiError("User with email already registered", 409);
  const avatarLocalPath = req?.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;
  if (!avatarLocalPath) throw new ApiError("Avatar file is required", 400);

  //upload on cloudinary:
  const avatarCloudiaryPath = await uploadOnCloudinary(avatarLocalPath);
  const coverImageCloudiaryPath = await uploadOnCloudinary(coverImageLocalPath);
  // console.log('this is avatarCloudiarypath', avatarCloudiaryPath);

  if (!avatarCloudiaryPath) throw new ApiError("Avatar file is required", 400);
  const newUser = await User.create({
    username,
    email,
    password,
    fullName,
    avatar: avatarCloudiaryPath.url,
    coverImage: coverImageCloudiaryPath?.url || "",
  });

  const createdUser = await User.findById(newUser?._id).select(
    "-password -refreshToken"
  ); // the select is use to remove to send the fields to front end
  if (!createdUser)
    throw new ApiError("Something went wrong while registering user", 500);
  return res
    .status(201)
    .json(new ApiResponse("User registerd successfully", createdUser, 201));
});

// loginController:-
const loginUser = asyncHandler(async (req, res, next) => {
  // get the email and pasword from user in body
  // validate the user is exist in database or not
  // if user found then check isPassword is correct
  // then generate teh accessToken and refresh token
  // then set the refresh token in cookeies
  // send the res use data and access token to user
  const { username, email, password } = req.body;
  if (!password || (!email && !username))
    throw new ApiError("Email or Username and password is required", 400);
  const validUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!validUser) throw new ApiError("Email not registerd Please registered first", 404);
  const isPasswordValid = await validUser.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError("Invalid User Credentials", 401);
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(validUser._id);
  const {refreshToken: refToken, password: pwd, ...rest} = validUser._doc;

  return res.status(200).cookie('Refresh-Token', refreshToken, options).json(new ApiResponse("User Logged in Successfully", {...rest, accessToken}, 200))
});

const logoutUser = asyncHandler(async(req, res, next)=> {
  const {_id}  = req.user;
  // const {Refresh_Token} = req.cookies;
  console.log('tis is id', _id)
  await User.findByIdAndUpdate(
    {_id},
    {
      $set: {refreshToken: null}
    },
    {
      new: true,
      runValidators: true,
    }
  )

  return res.status(200).clearCookie("Refresh-Token",options).json(new ApiResponse("User Logged Out Successfully", {}, 200))
})


const refreshAccessToken = asyncHandler(async(req, res, next) => {
    const incommingRefreshToken = req.cookies['Refresh-Token'] || req.body.refreshToken;
    if(!incommingRefreshToken) throw new ApiError("Unauthorized request", 401)

      let decodedToken;
      jwt.verify(incommingRefreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, async (error, decoded)=>{
        if(error) throw new ApiError("Invalid Refresh Token", 401);
        decodedToken = decoded;
      })

      const user = await User.findById(decodedToken?._id);
      if(!user) throw new ApiError("Invalid User", 401);

      if(incommingRefreshToken !== user?.refreshToken) 
        throw new ApiError("Refresh token is expired or user", 401)

      // Generate new accessToken:-
      const {accessToken, newRefreshToken} = generateAccessAndRefreshTokens(user._id);
      const {refreshToken: refToken, password: pwd, ...rest} = user._doc;

      return res.status(200).cookie('Refresh-Token', newRefreshToken, options).json(
        new ApiResponse("Access token refreshed", {...rest, accessToken}, 200)
      )
})

export { registerUser, loginUser, logoutUser, refreshAccessToken };
