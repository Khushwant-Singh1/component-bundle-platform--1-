'use strict'

module.exports = {
  // Base configuration
  base: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label }),
    },
  },
  
  // Pretty print for development
  prettyPrint: {
    colorize: true,
    levelFirst: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
  
  // File transport configuration (example)
  file: {
    filename: 'logs/app.log',
    level: 'info',
    maxsize: 10485760, // 10MB
    maxFiles: 5,
    colorize: false,
  },
  
  // Custom log levels
  customLevels: {
    fatal: 60,
    error: 50,
    warn: 40,
    info: 30,
    debug: 20,
    trace: 10,
  },
  
  // Custom serializers for specific objects
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      params: req.params,
      query: req.query,
      headers: req.headers,
      remoteAddress: req.remoteAddress,
      remotePort: req.remotePort,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      headers: res.getHeaders(),
    }),
  },
}
