import User from "../models/User.js";


export async function getRecommendedUsers(req,res){
    try{
        const currentUserId = req.user.id;
        const currentUser = req.user; 

        const recommendUsers = await User.find({
            $and:[
                {_is:{$ne:currentUserId}}, // exclude the current users
                {$id: {$nin: currentUser.friends}}, // exclude current user's friends
                {isOnboarded:true}
            ]
        });
        res.status(200).json({success:true,recommendUsers})
    }catch(err){
        console.error("Error in getRecommendedUsers controllers", err.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}
export async function getMyFriends(req,res){
    try{
        const user= await User.findById(req.user.id).select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage");
        res.status(200).json(user.friends);
    }catch(err){
        console.log("Error: ",err);
    }
}