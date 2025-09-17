import pino from 'pino';

// Create a logger instance
const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // More verbose logging in development
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard', // Format: YYYY-MM-DD HH:mm:ss
      ignore: 'pid,hostname',
    },
  },
  // Add custom log levels
  customLevels: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
  },
  // Define which level should be considered fatal
  levelVal: 60,
});

// Create a child logger for HTTP requests
const httpLogger = logger.child({ module: 'http' });

// Create a child logger for database operations
const dbLogger = logger.child({ module: 'database' });

export { logger, httpLogger, dbLogger };

export default logger;
