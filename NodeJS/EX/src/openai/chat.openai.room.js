const { Send } = require("./azure.openai.chat")
const { getClient } = require("../dbAccess/client.factory.js");
const clientInstance = getClient();

class OpenAIChat {
    constructor(io) {
        this.io = io;
        this.namespace = io.of('/openai')
        this.roomsDic = {};
    }
    Run() {

        this.namespace.on('connect', (socket) => {
            const ip = socket.request.headers['x-forwarded-for'] || socket.request.connection.remoteAddress;
            const id = socket.id;
            console.log(`연결  - 클라이언트IP: ${ip}, 소켓ID: ${id}`)
            socket.on('enter_the_room', (data) => {

                var roomID = data.roomID;
                var userInfo = data.userInfo;
                var room = this.GetChatRoom(roomID);
                if (room) {

                    this.RemoveRooms(socket, roomID)
                    room.EnterTheRoom(socket, userInfo);
                }

            })

            socket.on('req_room_instance', (data) => {
                this.CreateRoom(data);
                socket.emit('res_room_instance', data);
            })

            socket.on('disconnect', (reason) => {
                console.log(reason);
                console.log(`연결 종료 - 클라이언트IP: ${ip}, 소켓ID: ${socket.id}`)
                this.RemoveRooms(socket, -1)
            });

            socket.on('error', (error) => {
                console.log(`에러 발생: ${error}`);
            });
        });
    }
    ActiveRooms() {
        return Array.from(this.namespace.adapter.rooms.keys());
    }

    RemoveRooms(socket, withOutRoomID) {
        var activeRooms = this.ActiveRooms();
        for (var i in activeRooms) {
            var rid = activeRooms[i];
            if (rid !== withOutRoomID) {
                var r = this.GetChatRoom(rid);
                if (r) {
                    r.RemoveUser(socket);
                }
            }
        }
    }

    GetChatRoom(roomID) {
        for (var key in this.roomsDic) {
            if (roomID == key) {
                return this.roomsDic[roomID];
            }
        }

        return null;
    }

    CreateRoom(data) {
        var roomID = data.roomID;

        for (var key in this.roomsDic) {
            if (roomID == key) {
                return this.roomsDic[roomID];
            }
        }
        var roomName = data.roomName;

        this.roomsDic[roomID] = new OpenAIChatRoom(this.namespace, roomID, roomName, data.aiInfo);
        this.namespace.emit('created_room_instance', data);
        return this.roomsDic[roomID];
    }
}
class OpenAIChatRoom {
    constructor(namespace, roomID, roomName, ai) {

        this.roomID = roomID;
        this.roomName = roomName;
        this.namespace = namespace;
        this.ai = ai;
        this.users = {};
        this.messages = [];
    }

    EnterTheRoom(socket, userInfo) {

        if (socket.listeners(this.roomID).length === 0) {
            socket.on(this.roomID, (cmd) => {

                if (cmd.type === "userMessage") {
                    socket.broadcast.to(this.roomID).emit(this.roomID, cmd)

                    this.SendChatBot(cmd.obj.message);
                }

            });
        }
        socket.join(this.roomID);
        this.users[socket.id] = userInfo;
        socket.broadcast.to(this.roomID).emit(this.roomID, { type: "enterUser", obj: userInfo })
    }

    RemoveUser(socket) {
        socket.leave(parseInt(this.roomID));
        socket.broadcast.to(this.roomID).emit(this.roomID, { type: "removeUser", obj: this.users[socket.id] })
    }

    async SendChatBot(sendMsg) {


        if (sendMsg) {//&& sendMsg.length > 1 && sendMsg.substring(0, 1) == '@') {



            this.messages.push({ role: "user", content: sendMsg });

            // { role: "system", content: "You are a helpful assistant. You will talk like a pirate." },
            // { role: "user", content: "Can you help me?" },
            // { role: "assistant", content: "Arrrr! Of course, me hearty! What can I do for ye?" },
            // { role: "user", content: sendMsg },

            var msg = "";
            var totalMsg = "";
            var tmpLst = [];
            await Send(this.ai.id, this.messages, (rtnMsg) => {
                msg += rtnMsg;
                totalMsg += rtnMsg;
                if (msg.length > 100) {
                    tmpLst.push({ role: "assistant", content: msg });
                    msg = "";
                }
            });

            this.messages.push(tmpLst);
            this.messages.length = 0;
            await clientInstance.execute("pm_chat_message", { roomid: this.roomID, memberid: this.ai.id, message: totalMsg });
            this.namespace.to(this.roomID).emit(this.roomID, { type: "chatBotMessage", obj: { userInfo: this.ai, message: totalMsg } })

        }

    }
}

module.exports.OpenAIChatRoom = OpenAIChatRoom;
module.exports.OpenAIChat = OpenAIChat;
