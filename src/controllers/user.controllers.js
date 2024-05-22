import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import deleteImage from "../utils/removeCloudinary.js";
import uploadCloudinary from "../utils/uploadOnCloudinary.js";
import bcrypt from "bcryptjs";

const options = {
    httpOnly: true,
    secure: true
}

//SIGNUP
export const SignUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body;
        const avatarLocalPath = req.file?.path;
        if ([firstName, lastName, email, password, avatarLocalPath].some((field) => !field || field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };
        const existedUser = await User.findOne({ email });
        if (existedUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        };
        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await uploadCloudinary(avatarLocalPath, email);
        // console.log('response', response)
        const user = new User({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            avatar: {
                publicId: response?.public_id,
                url: response?.url
            },
            role: role || "user"
        })
        await user.save();
        const createdUser = await User.findOne({ email }).select("-password");
        const token = generateToken(createdUser._id);
        return res.status(200).cookie("token", token, options).
            json({
                success: true,
                message: "User registred successfully",
                isAuthenticated: true,
                data: createdUser
            });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// SIGNIN
export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log(email, password)
        if ([email, password].some((field) => !field || field?.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        };
        const user = await User.findOne({ email })
        // console.log(user);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        };
        const passwordCorrect = await bcrypt.compare(password, user.password);
        if (!passwordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Invalid credential"
            });
        }
        const loggedUser = await User.findById(user._id).select('-password')
        const token = generateToken(loggedUser._id);
        // console.log(token);
        return res.status(200)
            .cookie("token", token, options)
            .json({
                success: true,
                message: "User login successfully",
                data: loggedUser,
                isAuthenticated: true,
            });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// LOGOUT
export const Logout = async (req, res) => {
    try {
        res.cookie("token", "", {
            httpOnly: true,
            expires: new Date(Date.now()), // Expire the cookie immediately
        })
        return res.status(200).json({
            success: true,
            isAuthenticated: false,
            message: "User successfully logged out"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// FETCH A SINGLE USER
export const Profile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                user
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// FETCH ALL USERS
export const Users = async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        if (!users) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch"
            });
        }
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// FETCH ALL USERS
export const Sellers = async (req, res) => {
    try {
        const sellers = await User.find({ role: "seller" });
        console.log('sellers', sellers)
        if (!sellers) {
            return res.status(500).json({
                success: false,
                message: "Unable to fetch"
            });
        }
        return res.status(200).json({
            success: true,
            data: sellers
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// UPDATE USER PROFILE
export const UpdateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized user"
            });
        }
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        if (req.file && req.file.path) {
            if (user.avatar && user.avatar.publicId) {
                await deleteImage(user.avatar.publicId);
            }
            const userEmail = req.body.email ? req.body.email : user.email;
            console.log('userEmail', userEmail)
            const response = await uploadCloudinary(req.file.path, userEmail);
            user.avatar = {
                publicId: response.public_id,
                url: response.url
            }
        } else {
            user.avatar = user.avatar;
        }
        if (req.body.password && req.body.newPassword) {
            const isCorrectPassword = await bcrypt.compare(req.body.password, user.password);
            if (!isCorrectPassword) {
                return res.status(409).json({
                    success: false,
                    message: "Please provide the correct password"
                })
            }
            user.password = await bcrypt.hash(req.body.newPassword, 10);
        } else {
            user.password = user.password
        }

        const updatedUser = await user.save();
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: {
                _id: updatedUser._id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// DELETE USER
export const DeleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        await deleteImage(user.email);
        await User.deleteOne({_id: user._id})
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

//GET USER DETAIL BY ID
export const ProfileById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        } else {
            return res.status(200).json({
                success: true,
                user
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

// UPDATE USER ROLE BY ID
export const UpdatedUserRoleById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        user.role = req.body.role || user.role;
       const updatedUser = await user.save();
       return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            role: updatedUser.role,
            avatar: updatedUser.avatar
        }
    })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}