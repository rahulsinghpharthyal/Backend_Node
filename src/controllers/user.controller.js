import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { options } from "../constants.js";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // if we use save method so we need all required filed again in this case we have no any password we only save teh refreshtoken so that's why we are using the validateBeforeSave
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      "Something went wrong while generating access and refresh token",
      500
    );
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
  if (!validUser)
    throw new ApiError("Email not registerd Please registered first", 404);
  const isPasswordValid = await validUser.isPasswordCorrect(password);
  if (!isPasswordValid) throw new ApiError("Invalid User Credentials", 401);
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    validUser._id
  );
  const { refreshToken: refToken, password: pwd, ...rest } = validUser._doc;

  return res
    .status(200)
    .cookie("Refresh-Token", refreshToken, options)
    .json(
      new ApiResponse(
        "User Logged in Successfully",
        { ...rest, accessToken },
        200
      )
    );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  // const {Refresh_Token} = req.cookies;
  console.log("tis is id", _id);
  await User.findByIdAndUpdate(
    { _id },
    {
      $unset: { 
        refreshToken: 1 // this removes the field from document
      
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res
    .status(200)
    .clearCookie("Refresh-Token", options)
    .json(new ApiResponse("User Logged Out Successfully", {}, 200));
});

const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const incommingRefreshToken =
    req.cookies["Refresh-Token"] || req.body.refreshToken;
  if (!incommingRefreshToken) throw new ApiError("Unauthorized request", 401);

  let decodedToken;
  jwt.verify(
    incommingRefreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET,
    (error, decoded) => {
      if (error) throw new ApiError(error || "Invalid Refresh Token", 401);
      decodedToken = decoded;
    }
  );

  const user = await User.findById(decodedToken?._id);
  if (!user) throw new ApiError("Invalid User", 401);

  if (incommingRefreshToken !== user?.refreshToken)
    throw new ApiError("Refresh token is expired or user", 401);
  // Generate new accessToken:-
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);
  const { refreshToken: refToken, password: pwd, ...rest } = user._doc;
  return res
    .status(200)
    .cookie("Refresh-Token", newRefreshToken, options)
    .json(
      new ApiResponse("Access token refreshed", { ...rest, accessToken }, 200)
    );
});

const changeUserPassword = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(_id);
  const isOldPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isOldPasswordCorrect) throw new ApiError("Invalid Old Password", 400);
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  return res.status(200).json("Password successfully changed", {}, 200);
});

const updateUserAccount = asyncHandler(async (req, res, next) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) throw new ApiError("All Fields are required", 400);
  const user = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");
  return res
    .status(200)
    .json(new ApiResponse("Account details updated successfully", user, 200));
});

const updateUserAvatar = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const avatarLocalPath = req?.file?.path;
  if (!avatarLocalPath) new ApiError("Avatar file is missing", 400);
  const avatarCloudinaryPath = uploadOnCloudinary(avatarLocalPath);
  if (!avatarCloudinaryPath.url)
    new ApiError("Error while uploading avatar", 400);
  const user = await User.findOneAndUpdate(
    _id,
    {
      $set: { avatar: avatarCloudinaryPath?.url },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  return res.status(200).json("Avatar updated Successfully", user, 200);
});

const updateUserCoverImage = asyncHandler(async (req, res, next) => {
  const { _id } = req.user;
  const coverImageLocalPath = req?.file?.path;
  if (!coverImageLocalPath) new ApiError("Cover image file is missing", 400);
  const coverImageCloudinaryPath = uploadOnCloudinary(coverImageLocalPath);
  if (!coverImageCloudinaryPath.url)
    new ApiError("Error while uploading cover image", 400);
  const user = await User.findOneAndUpdate(
    _id,
    {
      $set: { avatar: coverImageCloudinaryPath?.url },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");
  return res.status(200).json("Cover Image updated Successfully", user, 200);
});

const getUserChannelProfile = asyncHandler(async (req, res, next) => {
  const { username } = req.params;
  if (!username?.trim()) throw ApiError("username is missing", 400);
  const channel = await User.aggregate([
    {
      $match: {username: username?.toLowerCase()}
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscription",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers"
        },
        channelsSubscribedToCount: {
          $size : "$subscribedTo"
        },
        isSubscribed: {
          $cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false,
          }
        }
      }
    },
    {
      $project: {
        fullName:1,
        username:1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }
  ]);
  console.log(channel);
  if(!channel) throw new ApiError("Channel does not exists", 404);
  return res.status(200).json(new ApiResponse("User Channel Fetched Successfully!",channel[o], 200))
});


const getWatchHistory = asyncHandler(async(req, rex, next) => {
    const {_id} = req.user;

    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id)
        }
      },
      {
        $lookup: {
          from: 'videos',
          localField: 'watchHistory',
          foreignField: '_id',
          as: 'watchHistory',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: "owner",
                foreignField: "_id",
                as: 'owner',
                pipeline: [
                  {
                    $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                    }
                  }
                ]
              }
            },
            {
              $addFields: {
              owner: {
                $first: "$owner"
              }
            }
          }
          ]
        }
      }
    ])
    console.log('this is watchHistory user', user)
    return res.status(200).json(ApiResponse("Watch History fetched Successfully", user[0].watchHistory, 200))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeUserPassword,
  updateUserAccount,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
