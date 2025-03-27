import asyncHandler from "../utils/asyncHandler.js";
import ApiError from '../utils/ApiError.js';
import jwt from "jsonwebtoken";


const isAuthenticate = asyncHandler(async(req, res, next) => {
   try {
      console.log('this is refresh token',req.cookies["Refresh-Token"])
      const authHeader =  req.header("Authorization") || req.header("authorization");
      if(!authHeader) throw new ApiError('Please Login to access', 403);
      const token = authHeader.split(" ")[1];
      if(!token) throw new ApiError("Unauthorized Request", 401);
      jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (error, decodedToken)=>{
         if(error) throw new ApiError("Forbidden", 403); // Invalid Token,
         req.user = decodedToken;
      });  
      next();
   } catch (error) {
      throw new ApiError(error.message || 'Invalid Access Token', 401);
   }
})

export default isAuthenticate;