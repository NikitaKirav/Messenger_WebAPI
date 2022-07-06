const Message = require('../models/Message');
const Profile = require('../models/Profile');
const Photo = require('../models/Photo');

const getChatList = async (clients, { from }) => {

    const incomingMessages = await Message.find({ to: from });
    const outgoingMessages = await Message.find({ from: from});
    
    const messages = [...incomingMessages, ...outgoingMessages].sort((a, b) => {
        if (a.createDate > b.createDate){
            return 1;
        } else {
            return -1;
        }
    });
    let chatList = [];
    let chatMessages = [];
    let isUserId = false;
    for(let i=0; i < messages.length; i++) {    
        if(messages[i].from !== from) {
            messages[i].userId = messages[i].from;
            chatMessages.push(messages[i]);
        }   
        if(messages[i].to !== from) {
            messages[i].userId = messages[i].to;
            chatMessages.push(messages[i]);
        } 
    }
    for(let i=(chatMessages.length-1); i >= 0; i--) { 
        if(chatList.length > 0) {
            const userId = chatList.find((mes) => mes.userId === chatMessages[i].userId);
            isUserId = userId ? true : false;
        } 
        if (!isUserId) {
            const fromProfile = await Profile.findOne({userId: chatMessages[i].from});
            const fromPhoto = await Photo.findOne({profileId: fromProfile.id});
            const toProfile = await Profile.findOne({userId: chatMessages[i].to});
            const toPhoto = await Photo.findOne({profileId: toProfile.id});
            chatMessages[i].toPhoto = toPhoto.small;
            chatMessages[i].toUserName = toProfile.fullName;
            chatMessages[i].fromPhoto = fromPhoto.small;
            chatMessages[i].fromUserName = fromProfile.fullName;
            chatList.push(chatMessages[i]);
        } 
    }

    if (messages.length > 0) {
        clients[from].send(`{"action": "getChatList", "chatList": [${chatList.map(mes => `{
            "from": "${mes.from}",
            "to": "${mes.to}",
            "fromUserName": "${mes.fromUserName}",
            "toUserName": "${mes.toUserName}",
            "text": "${mes.text}",
            "updateDate": "${mes.updateDate.toLocaleString()}",
            "fromPhoto": "${mes.fromPhoto}",
            "toPhoto": "${mes.toPhoto}",
            "userId": "${mes.userId}"
            }`
        )}]}`);
    }
}

const getMessagesFromUser = async (clients, { from , to}) => {
    const incomingMessages = await Message.find({from: to, to: from});
    const outgoingMessages = await Message.find({ from: from, to: to});
    const messages = [...incomingMessages, ...outgoingMessages].sort((a, b) => {
        if (a.createDate > b.createDate){
            return 1;
        } else {
            return -1;
        }
    });
    clients[from].send(`{"action": "getMessagesFromUser", "messages": [${messages.map(mes => `{
        "from": "${mes.from}",
        "to": "${mes.to}",
        "text": "${mes.text}",
        "updateDate": "${mes.updateDate.toLocaleString()}",
        "fromPhoto": "${mes.fromPhoto}"
    }`)}]}`);
}

const getUserAvatar = async (clients, { from, userId }) => {
    const data = [];
    for(let i=0; i < userId.length; i++) {
        const profile = await Profile.findOne({userId: userId[i]});
        if (profile) {
            const photo = await Photo.findOne({profileId: profile.id});
            data.push({
                userId: userId[i],
                userAvatar: photo.small,
                userName: profile.fullName
            })
        }
    }

    if((data.length > 0) && (from === data[0].userId)) {
        clients[from].send(`{"action": "getUserAvatar", "userAvatar": {
            "userId": "${data[0].userId}", 
            "userAvatar": "${data[0].userAvatar}",
            "userName": "${data[0].userName}"
        }}`);
    } else if((data.length > 0) && (from !== data[0].userId)) {
        clients[from].send(`{"action": "getUserAvatar", "usersAvatarsFriends": [${data.map(user => `{
            "userId": "${user.userId}", 
            "userAvatar": "${user.userAvatar}",
            "userName": "${user.userName}"
        }`)}]}`);
    }
}

module.exports = { getChatList, getMessagesFromUser, getUserAvatar }