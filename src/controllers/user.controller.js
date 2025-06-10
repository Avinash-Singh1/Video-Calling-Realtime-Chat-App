import FriendRequest from "../models/FriendRequest.js";
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
        res.status(200).json({recommendUsers});
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
export async function sendFriendRequest(req,res) {
    try{
        const myId= req.user.id;
        const {id:recipientId} = req.params;

        // prevent sending req to yourself
        if(myId == recipientId) return res.status(400).json({message:"You can't send friend request to yourself"});

        // check if reciepient exist 
        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({message:"Recipient not Found"});
        }
        // check if user is alredy is friends 
        if(recipient.friends.includes(myId)){
            return res.status(400).json({message:"You are already friends with this user"});
        }

        // check if a req alredy exist
        const existingRequest= await FriendRequest.findOne({
            $or:[
                {
                    sender:myId, recipient: recipientId
                },
                {
                    sender:recipientId, recipient:myId
                },
            ]
        })
        if(existingRequest){
            return res.status(400).json({message:"A friend request alredy exist between you and this user"});
        }

        const friendRequest= await FriendRequest.create({
            sender:myId,
            recipient: recipientId,
        });

        res.status(201).json(friendRequest);
    }catch(err){
        console.error("Error in sending friendRequest controller ", err.message);
        res.status(500).json({message: "Internal Server Error"});
    }
}

export const  acceptFriendRequest=async(req,res)=>{
    try{
        const {id:requestId}=req.params;
        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({message:"Friend request not found"})
        }

        if(friendRequest.recipient.toString() != req.user.id){
            return res.status(403).json({message:"You are not authorized to accept this request"});
        }

        friendRequest.status= "accepted";
        await friendRequest.save();

        // add each user to the others friends array 
        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: {friends: friendRequest.recipient},
        })

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{
                friends:friendRequest.sender
            },
        });

        res.status(200).json({message:"Friend reuest accepted"})
    }catch(err){
        console.log("Error in acceptFriendRequest controller",err.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getFriendRequests=async(req,res)=>{
    try{
        const incomingReqs = await FriendRequest.find({
            recipient:req.user.id,
            status:"pending",
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage ");

        const acceptedReqs = await FriendRequest.find({
            sender: req.user.id,
            status:"accepted",

        }).populate("recipient","fullName profilePic");
        res.status(200).json({incomingReqs, acceptedReqs});

    }catch(err){
        console.log("Error in getPendingFriendRequests controller",err.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const getOutgoingFriendReqs= async(req,res)=>{
    try{
        const outgoingRequests = await FriendRequest.find({
            sender: req.user.id,
            status:"pending",
        }).populate("recipient","fullName profilePic nativeLanguage leaningLanguage")
        res.status(200).json(outgoingRequests);
    }catch(err){
        console.log("Error in the getOutGoingFriendReqs controllers",err.message);
        res.status(500).json({message:"Internal Server Error"});
    }
}