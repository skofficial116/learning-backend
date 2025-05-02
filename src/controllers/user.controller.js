import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and refress tokens."
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const {  username, password, fullName } = req.body;

  // Validation for required fields
  // if (!email) throw new ApiError(400, "Email is required!");
  if (!username) throw new ApiError(400, "Username is required!");
  if (!password) throw new ApiError(400, "Password is required!");
  if (!fullName) throw new ApiError(400, "Full Name is required!");

  // Check for existing user
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    throw new ApiError(
      409,
      "User with the given username already exists!"
    );
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    // avatar: avatar.url,
    // coverImage: cover?.url || "",
    password,
  });

  // Remove sensitive data before sending response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User Registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  
  const { username, password } = req.body;
  if (!username ) {
    throw new ApiError(400, "username is required!");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, " username does not exist. Kindly register.");
  }

  const passwordCheck = await user.isPasswordCorrect(password);

  if (!passwordCheck) {
    throw new ApiError(404, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    htttpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (res, req) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    htttpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const accessRefreshToken = asyncHandler(async (res, req) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_KEY
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid Token");
    }

    if (incomingRefreshToken != user.refreshToken) {
      throw new ApiError(401, "Refresh token either expired or used");
    }
    const options = {
      htttpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } = generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "refresh Token generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Unauthorized Access");
  }
});

export { registerUser, loginUser, logoutUser, accessRefreshToken };

