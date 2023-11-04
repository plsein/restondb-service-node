const fs = require('fs');
const pino = require('pino');
const pretty = require('pino-pretty');
const { Config } = require('../configs/config');

const streams = [
  {stream: fs.createWriteStream(Config['LOG_DIR']+'/info.stream.out')},
  {stream: pretty() },
  {level: 'debug', stream: fs.createWriteStream(Config['LOG_DIR']+'/debug.stream.out')},
  {level: 'fatal', stream: fs.createWriteStream(Config['LOG_DIR']+'/fatal.stream.out')}
];

const appLog = pino({
  level: 'debug' // this MUST be set at the lowest level of the destinations
}, pino.multistream(streams));

appLog.debug('this will be written to debug.stream.out');
appLog.info('this will be written to debug.stream.out and info.stream.out');
appLog.fatal('this will be written to debug.stream.out, info.stream.out and fatal.stream.out');

/**
 * Reference: https://github.com/pinojs/pino-http
 */
const reqLogger = require('pino-http')({
  logger: appLog,
  autoLogging: true,
  redact: ["req.headers.authorization"]
});

exports.appLog = appLog;
exports.reqLogger = reqLogger;
