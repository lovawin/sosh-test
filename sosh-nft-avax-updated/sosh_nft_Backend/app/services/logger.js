const winston = require('winston');
const { NODE_ENV } = require('../../config/appconfig');
require('winston-daily-rotate-file');

const { format } = winston;
const { transports } = winston;
const appConfig = require('../../config/appconfig');

const config = {
  levels: {
    error: 0,
    debug: 1,
    warn: 2,
    data: 3,
    info: 4,
    verbose: 5,
    silly: 6,
    custom: 7,
  },
  colors: {
    error: 'red',
    debug: 'blue',
    warn: 'yellow',
    data: 'grey',
    info: 'green',
    verbose: 'cyan',
    silly: 'magenta',
    custom: 'yellow',
  },
};

winston.addColors(config.colors);

const dynamicContent = (info) => ({ ...info, message: info.message });

const logger = winston.createLogger({
  levels: config.levels,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format(dynamicContent)(),
    format.printf((info) => `${info.level}: [ ${info.timestamp} ] ${info.message}`),
  ),
});

// apply check for dir , if no then create one

if (appConfig.logsConfig.dailyRotateFileEnable) {
  logger.add(
    new transports.DailyRotateFile({
      level: 'debug',
      dirname: appConfig.logsConfig.dirname,
      filename: '%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),
  );
} else {
  logger.add(
    new transports.File({
      level: 'info',
      dirname: appConfig.logsConfig.dirname,
      filename: 'info.log',
    }),
  );
}

// Add Console transport for both development and production
logger.add(
  new transports.Console({
    level: 'debug', // Allow debug level logs
    format: format.combine(
      format.colorize(),
      format.simple(),
      format.printf((info) => `${info.level}: [ ${info.timestamp} ] ${info.message}`),
    ),
  }),
);

module.exports = logger;
