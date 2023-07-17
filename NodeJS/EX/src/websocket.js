const express = require('express');
const socketIO = require("socket.io");
const app = express();
const { OpenAIChat } = require('./openai/chat.openai.room')
const dotenv = require("dotenv");
dotenv.config();
app.set('port', process.env.SOCKETPORT);

const server = app.listen(app.get('port'), () => {
    console.log(`Server is Listening at ${app.get('port')}`);
})


const io = socketIO(server, { path: "/" });
const openAIChat = new OpenAIChat(io);
openAIChat.Run();
