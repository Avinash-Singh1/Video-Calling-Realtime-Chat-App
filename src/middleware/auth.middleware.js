import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protectRoute= async (req, res, next) => {
    try{
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "Unauthorized- User not Found" });
        }
        req.user = user;
        next();
    }catch (error) {
            return res.status(401).json({ message: "Protected route Errors" });
    }
}