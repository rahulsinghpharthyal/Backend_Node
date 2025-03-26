import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from '../models/user.models.js';
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/apiResponse.js";

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

    const {username, email, password, fullName} = req.body;
    console.log('this is body', req.body);
    console.log("req.files:", req.files);

    if(!fullName || !email || !password || !username) throw new ApiError("all fields are required", 400);
    const existingUser = await User.findOne({email});
    if(existingUser) throw new ApiError("User with email already registered", 409);
    const avatarLocalPath = req?.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req?.files?.coverImage?.[0]?.path;
    if(!avatarLocalPath) throw new ApiError("Avatar file is required", 400);

    //upload on cloudinary:
    const avatarCloudiaryPath =  await uploadOnCloudinary(avatarLocalPath);
    const coverImageCloudiaryPath =  await uploadOnCloudinary(coverImageLocalPath);
    // console.log('this is avatarCloudiarypath', avatarCloudiaryPath);

    if(!avatarCloudiaryPath) throw new ApiError("Avatar file is required", 400);
    const newUser = await User.create({
        username,
        email,
        password,
        fullName,
        avatar: avatarCloudiaryPath.url,
        coverImage: coverImageCloudiaryPath?.url || "",
    })

    const createdUser = await User.findById(newUser?._id).select(
        "-password -refreshToken"
    ); // the select is use to remove to send the fields to front end
    if(!createdUser) throw new ApiError("Something went wrong while registering user", 500);
    return res.status(201).json(new ApiResponse("User registerd successfully", createdUser, 201))
});

export { registerUser };
