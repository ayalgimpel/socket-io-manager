const express = require('express');
const app = express();
const config = require('config');
const serverConfig = config.get('server');
const port = serverConfig.port || 3002;
const host = serverConfig.host || '0.0.0.0';
const pkg = require('./package.json');
const redis = require('./src/redis');
const socketManager = require('./src/socket-manager');


try {
    const logger = require('./src/core/logger');

    logger.log('info', `initialize ${pkg.name} version ${pkg.version}`);

    logger.log('info', `configuration ${JSON.stringify(config)}`);

    app.use(express.urlencoded({ extended: false }))
    app.use(express.json())

    redis.init();

    app.get("/", (req, res) => res.send(`server is up time:${new Date().toJSON()}`));

    const server = app.listen(port, host, () => {
        logger.log('info', `Running on http://${host}:${port}`)
    });

    socketManager.initialize(server);


} catch (error) {
    console.log(`error - ${error.message}`);
}