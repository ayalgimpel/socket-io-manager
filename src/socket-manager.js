const { Server } = require("socket.io");
// const connectionProvider = require('./providers/connection.provider');
const EventTypes = require('../src/event-types');
const logger = require('./core/logger');
const _ = require('lodash');

let io = {};
const unknownClients = {};
const clients = {};

module.exports = {
    initialize(server) {
        io = new Server(server, {
            cors: {
                origin: ["*"]
            }
        });

        io.on('connection', (socket) => {

            this.connect(socket);

            socket.on('client-registration', async ({ user, token }, callback) => {

                logger.log('info', `🌐 client-registration! **`, socket.id);
                // const connections = await connectionProvider.get({ token, userId }) || [];
                // const connectionIds = connections.map(connection => `${connection._id}`);

                //socket.join(connectionIds);
                this.set(user._id, socket.id, { userId: user._id, loggedIn: new Date(), active: true });

                this.clientActive({ userId: user._id, user });

                const activeClientIds = Object.keys(clients);
                socket.emit("users", activeClientIds);
                callback();
            });

            // socket.on('connect-connection', async ({ userId, connectionId }, callback) => {
            //     logger.log('info', `🌐 connect-connection! ** connectionId: ${connectionId}`);
            //     socket.join(connectionId);
            // });

            socket.on("disconnect", () => {
                this.disconnect(socket.id);
            });

        });
    },
    connect(socket) {
        const key = socket.id;
        logger.log('info', '👾 New socket connected! ++', socket.id);
        unknownClients[key] = { socketId: key, connectionTime: new Date(), socket };
    },
    disconnect(id) {
        logger.log('info', "👹 socket disconnected! -- ", id);


        console.log("------------clients");

        let disconnectedUser;
        _.forIn(clients, (value, key) => {
            if (value.socketId === id)
                disconnectedUser = value;
        });

        delete clients[id];
        if (disconnectedUser !== undefined) {
            this.clientInactive({ userId: disconnectedUser.userId });
        }
    },
    clientActive({ userId }) {
        _.forIn(clients, (value, key) => {
            io.to(value.socketId).emit('user-active', { message: { userId, event: "user-active" } });
        });

    },
    clientInactive({ userId }) {
        _.forIn(clients, (value, key) => {
            io.to(value.socketId).emit('user-inactive', { message: { userId, event: "user-inactive" } });
        })
    },
    set(userId, socketId, userSocket) {
        const unknownClient = unknownClients[socketId];
        clients[userId] = Object.assign(userSocket, unknownClient);

        delete unknownClients[socketId];
    },
    get(key) {
        return clients[key];
    },
    publishEvent(eventName, message) {
        logger.log('info', `📢 broadcast-message event ['${eventName}']: ${JSON.stringify(message)}`);
        // io.in(message.data.connectionId).emit(eventName.toString(), message);
        const { from, to } = message;
        console.log('client to');
        // console.log(clients);
        // clients[from].socket.to(from).emit(eventName.toString(), message);

        const fromSocket = clients[from].socket;

        console.log(`socket from: ${fromSocket.id}`);
        io.to(fromSocket.id).emit(eventName.toString(), {
            message,
            from: fromSocket.id,
            fromUser: fromSocket.userId,
        });

        const toSocket = clients[to].socket;
        console.log(`socket to: ${toSocket.id}`);
        io.to(toSocket.id).emit(eventName.toString(), {
            message,
            from: toSocket.id,
            fromUser: toSocket.userId,
        });

        // clients[to].socket.to(to).emit(eventName.toString(), message);
    }
}