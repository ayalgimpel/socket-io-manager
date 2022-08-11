module.exports = {
    log: (type, message, info) => {
        const now = new Date();
        console.log(`[${now.toISOString()}]: (${type}) => ${message} ${info}`);
    }
}