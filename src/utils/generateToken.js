import jwt from "jsonwebtoken";

const generateToken = (userId) => {
    return jwt.sign(
        {
            _id: userId
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export default generateToken;