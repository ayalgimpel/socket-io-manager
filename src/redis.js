const redis = require('redis');
const config = require('config');
const redisConfig = config.get('redis');
const subscriber = redis.createClient({ host: ' 0.0.0.0', port: '6379' });
const socketManager = require('./socket-manager');
const EventTypes = require('../src/event-types');
const logger = require('./core/logger');

const init = () => {

    try {

        subscriber.on('error', (err) => {
            logger.log('error', 'Error occured while connecting or accessing redis server ' + err.message)
        });

        subscriber.on("message", (channel, message) => {
            logger.log('info', `[${channel}] => ${JSON.stringify(message)}`);

            switch (channel) {
                case EventTypes.subscribes.MESSAGE_CREATED:
                    socketManager.publishEvent(EventTypes.socketEvents.MESSAGE_CREATED, JSON.parse(message));
                    break;
                case EventTypes.subscribes.INVITATION_CREATED:
                    socketManager.publishEvent(EventTypes.socketEvents.INVITATION_CREATED, JSON.parse(message));
                    break;
                case EventTypes.subscribes.GAME_CREATED:
                    socketManager.publishEvent(EventTypes.socketEvents.GAME_CREATED, JSON.parse(message));
                    break;
                case EventTypes.subscribes.GAME_UPDATED:
                    socketManager.publishEvent(EventTypes.socketEvents.GAME_UPDATED, JSON.parse(message));
                    break;
                case EventTypes.subscribes.GAME_ENDED:
                    socketManager.publishEvent(EventTypes.socketEvents.GAME_ENDED, JSON.parse(message));
                    break;
            }
        })

        // MESSAGE EVENTS
        subscriber.subscribe(EventTypes.subscribes.MESSAGE_CREATED);

        // INVITATION EVENTS
        subscriber.subscribe(EventTypes.subscribes.INVITATION_CREATED);

        // GAME EVENTS
        subscriber.subscribe(EventTypes.subscribes.GAME_CREATED);
        subscriber.subscribe(EventTypes.subscribes.GAME_UPDATED);
        subscriber.subscribe(EventTypes.subscribes.GAME_ENDED);

    } catch (error) {
        logger.log('error', "redis error ", error.message);
    }
}

module.exports = {
    init
}