import jwt from "jsonwebtoken";
import User from "../models/user.model.js"

export const verifyUser = async(req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) {
            return res.status(401).json({
                success: false,
                message:"Unauthenicated request",
                isAuthenticated: false
            });
        };
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            return res.status(404).json({
                success: false,
                message:"Invalid token",
                isAuthenticated: false
            });
        }
        req.user = user;
        // console.log('user test pass')
        next();
} catch (error) {
    return res.status(500).json({
        success: false,
        message: error.message,
        isAuthenticated: false
    });
}
}

export const authorizedAdmin = async (req, res, next) => {
    if(req.user && req.user.role === 'admin') {
        // console.log('admin test pass')
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an admin",
            isAuthenticated: false
        });
    }
}

export const authorizedSeller = async (req, res, next) => {
    if(req.user && req.user.role === 'seller') {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an seller",
            isAuthenticated: false
        });
    }
}

export const authorizedAdminOrSeller = async (req, res, next) => {
    if(req.user && ( req.user.role === 'seller' || req.user.role === 'admin' )) {
        next()
    } else {
        return res.status(401).json({
            success: false,
            message:"Not authorized as an seller",
            isAuthenticated: false
        });
    }
}