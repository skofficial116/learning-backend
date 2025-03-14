import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    //getting data from the data
    const { email, username, password, fullName } = req.body


    //validation non-empty
    if (email === '') {
        throw new ApiError(400, "Email is required!!")
    } else if (username === '') {
        throw new ApiError(400, "Username is required!!")
    } else if (password === '') {
        throw new ApiError(400, "Password is required!!")
    } else if (fullName === '') {
        throw new ApiError(400, "Full Name is required!!")
    }


    // checking existing username or email
    const existedUser = User.findOne({ username })
    if (existedUser) {
        throw new ApiError(409, "User with the given username already exists!!")
    }
    const existedEmail = User.findOne({ email })
    if (existedEmail) {
        throw new ApiError(409, "User with the given email already exists!!")
    }
    const avatarLocalFilePath = req.files?.avatar[0]?.path;
    const coverLocalFilePath = req.files?.coverImage[0]?.path;

    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Avatar file is required!!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalFilePath);
    const cover = await uploadOnCloudinary(coverLocalFilePath);
    if (!avatar) {
        throw new ApiError(400, "Avtar file is required!!");
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: cover?.path || "",
        username: username.toLowerCase(),
        password,
        email
    })
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!!")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully!!")
    )

}
)


export { registerUser };