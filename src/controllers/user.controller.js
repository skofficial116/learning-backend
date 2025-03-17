import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/users.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";



const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and refress tokens.")
    }
}

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
    const existedUser = await User.findOne({ username })
    if (existedUser) {
        throw new ApiError(409, "User with the given username already exists!!")
    }
    const existedEmail = await User.findOne({ email })
    if (existedEmail) {
        throw new ApiError(409, "User with the given email already exists!!")
    }
    const avatarLocalFilePath = req.files?.avatar[0]?.path;
    console.log(avatarLocalFilePath);

    // const coverLocalFilePath = req.files?.coverImage[0]?.path;
    let coverLocalFilePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage[0]) {
        coverLocalFilePath = req.files.coverImage[0];
    }

    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Avatar file is required!!")
    }
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log(avatarLocalFilePath.path);
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');
    // console.log('');

    const avatar = await uploadOnCloudinary(avatarLocalFilePath);
    const cover = await uploadOnCloudinary(coverLocalFilePath);
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required!!");
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

const loginUser = asyncHandler(async (req, res) => {
    //ask email/username and pasword
    // check if usrnmae/email exists
    //check for password
    const { username, email, password } = req.body;
    if (!username || !email) {
        throw new ApiError(400, "email/username is required!")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, " username/email does not exist. Kindly register.")
    }

    const passwordCheck = await user.isPasswordCorrect(password)

    if (!password) {
        throw new ApiError(404, "Invalid User Credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        htttpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                user: loggedUser, accessToken, refreshToken
            },
                "User logged in Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (res, req) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        htttpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const accessRefreshToken = asyncHandler(async (res, req) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_KEY)

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid Token")
        }

        if (incomingRefreshToken != user.refreshToken) {
            throw new ApiError(401, "Refresh token either expired or used")
        }
        const options = {
            htttpOnly: true,
            secure: true
        }
        const { accessToken, newRefreshToken } = generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
                    },
                    "refresh Token generated"

                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized Access")
    }

})

export { registerUser, loginUser, logoutUser, accessRefreshToken };