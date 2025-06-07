import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js"; 
import jwt from "jsonwebtoken";
export const login=async(req,res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).send("Email and password are required");
        }
        const user= await User.findOne({ email });
        if(!user){
            return res.status(404).send("Invalid email or password");
        }
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(401).send("Invalid email or password");
        }

        const token= jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("jwt", token, {
            httpOnly: true, // 
            secure: process.env.NODE_ENV === "production", // Use secure cookies in production
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        }); 

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                profilePic: user.profilePic,
            },
            token, // Send the JWT token in the response
        });
    }catch{
        res.status(400).send("Login failed");
    }
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

        await newUser.save();

        // TODO: Create the user in the stream as well
        try{
            await upsertStreamUser({
            id: newUser._id.toString(),
            name: newUser.fullName,
            image: newUser.profilePic || "",
            });
            console.log(`Stream user created for ${newUser.fullName}`);
        }catch (error) {
            console.error("Error upserting Stream user:", error);
            return res.status(500).send("Failed to create user in Stream");
        }
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

} 
export const logout=(req,res)=>{
   res.clearCookie("jwt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    });
    res.status(200).json({ success:true,message: "Logout successful" });
}
export const onboard=async(req,res)=>{
    try{
        const userId =req.user._id;
        const {fullName,bio,nativeLanguage, learningLanguage, location}= req.body;
        if(!fullName || !bio || nativeLanguage || !learningLanguage || !location){
            return res.status(400).json({
                message:"All fields are required",
                missingFields:[
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location",
                ],
            });
        }
        await User.findByIdAndUpdate(userId,{
            ...req.body,
            isOnboarded:true,
        })
    }catch(err){

    }
}