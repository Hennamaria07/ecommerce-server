import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            trim: true,
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true
        },
        avatar: {
            publicId: String,
            url: String
        },
        password: {
            type: String,
            required: true,
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
        role: {
            default: "user",
            enum: ["user", "seller", "admin"]
        }
    },
    {
        timestamps: true
    }
)

const User = mongoose.model("User", userSchema);

export default User;