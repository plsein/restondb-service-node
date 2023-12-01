const fs = require('fs');
const pino = require('pino');
const pretty = require('pino-pretty');
const { Config } = require('../configs/config');

const streams = [
  {stream: fs.createWriteStream(Config['LOG_DIR']+'/info.stream.log')},
  {stream: pretty() },
  {level: 'debug', stream: fs.createWriteStream(Config['LOG_DIR']+'/debug.stream.log')},
  {level: 'fatal', stream: fs.createWriteStream(Config['LOG_DIR']+'/fatal.stream.log')}
];

const appLog = pino({
  level: 'debug' // this MUST be set at the lowest level of the destinations
}, pino.multistream(streams));

appLog.debug('this will be written to debug.stream.log');
appLog.info('this will be written to debug.stream.log and info.stream.log');
appLog.fatal('this will be written to debug.stream.log, info.stream.log and fatal.stream.log');

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
