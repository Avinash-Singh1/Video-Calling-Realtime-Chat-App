import User from "../models/User.js"; 
import jwt from "jsonwebtoken";
export const login=(req,res)=>{
    res.send("login Route");
}
export const Singup=async(req,res)=>{
    const {email, password, fullName} = req.body;
    try{
        if(!email || !password || !fullName) {
            return res.status(400).send("All fields are required");
        }

        if(password.length < 6) {
            return res.status(400).send("Password must be at least 6 characters long");
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
        // Here you would typically check if the user already exists in the database
        const existingUser =await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }
     
        const idx = Math.floor(Math.random() * 100)+1; // Random index for profile picture
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

           // Create a new user
        const newUser = new User({
            fullName,
            email,
            password, // Password will be hashed by the pre-save hook in the User model
            profilePic: randomAvatar,
        });

        // Todo : Create the user in the stream as well
        const token= jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true, // 
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }); 

        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            },
            token, // Send the JWT token in the response
        });


    }catch (error) {
        console.error("Error during signup:", error);
        res.status(500).send("Internal Server Error");
    }
    res.send("Singup Route");
}
export const logout=(req,res)=>{
    res.send("logout Route");
}