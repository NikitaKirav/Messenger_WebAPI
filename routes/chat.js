const Message = require('../models/Message');
const Photo = require('../models/Photo');
const Profile = require('../models/Profile');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


const chatRouter = require('./chat.router');

// sign in clients
var clients = [];

const incoming = async (ws, data) => {
    try {
        let message = JSON.parse(data);
        
        const token = message.token; // "Bearer TOKEN"
        if(token) {
            const secret = process.env.MESSANGER_JWT_SECRET;
            const decoded = jwt.verify(token, secret, {ignoreExpiration: true} );
            const userInfo = decoded;

            clients[userInfo.userId] = ws;

            if(message.action && message.action === "getChatList") {
                chatRouter.getChatList(clients, {from: userInfo.userId});
            }

            if(message.action && message.action === "getUserAvatar") {
                chatRouter.getUserAvatar(clients, {from: userInfo.userId, userId: message.userId});
            }

            // Send a user a list of online users        
            for(var keyMain in clients)  {
                let onlineUsers = [];
                for(var key in clients) {
                    if (key !== keyMain) {
                        const profile = await Profile.findOne({userId: key});
                        const photo = await Photo.findOne({profileId: profile.id});
                        onlineUsers.push({ userId: key, photo: photo.small, userName: profile.fullName });  
                    
                    }
                }
                if(onlineUsers.length > 0) {
                    clients[keyMain].send(`{"onlineUsers": [${onlineUsers.map(user => `{
                        "userId": "${user.userId}",
                        "photo": "${user.photo}",
                        "userName": "${user.userName}"
                    }`)}]}`);
                }
            }

            //Send a list of a last message from users
            if(message.action && message.action === "getLastMessageFromUsers") {
                const incomingMessages = await Message.find({from: message.to, to: message.from});
                const outgoingMessages = await Message.find({ from: message.from, to: message.to});
                const messages = [...incomingMessages, ...outgoingMessages].sort((a, b) => {
                    if (a.createDate > b.createDate){
                        return 1;
                    } else {
                        return -1;
                    }
                });
                clients[message.from].send(`{"action": "getMessagesFromUser", "messages": [${messages.map(mes => `{
                    "from": "${mes.from}",
                    "to": "${mes.to}",
                    "text": "${mes.text}",
                    "updateDate": "${mes.updateDate.toLocaleString()}",
                    "fromPhoto": "${mes.fromPhoto}"
                }`)}]}`);
            }

            //Send a list of messages
            if(message.action && message.action === "getMessagesFromUser") {
                chatRouter.getMessagesFromUser(clients, {from: userInfo.userId, to: message.to});
            }

            if(message.text) {
                // if addressee is online
                //if(clients[message.to]) {
                    const newMessage = new Message({
                        from: message.from,
                        to: message.to,
                        text: message.text,
                        createDate: Date.now(),
                        updateDate: Date.now()
                    });
                    const result = await newMessage.save();

                    const messageForSending = `{"action": "saveMessage", "message": {"from": "${result.from}",
                    "to": "${result.to}",
                    "text": "${result.text}",
                    "updateDate": "${result.updateDate.toLocaleString()}",
                    "fromPhoto": "${result.fromPhoto}"}}`
                    clients[message.from].send(messageForSending);
                    if(clients[message.to]) {
                        clients[message.to].send(messageForSending);
                    }
                //}
            }
        }
    } catch(error) {
        console.log(error);
    }
}

module.exports = incoming;