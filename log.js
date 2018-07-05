const winston = require('winston')
const dayjs = require('dayjs')
const date = dayjs().format('YYYY_MM_DD')

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: `./data/${date}.log` })
  ]
})

module.exports = {
  log(info) {
    logger.log({
      level: 'info',
      message: info
    })
  },
  warn(info) {
    logger.log({
      level: 'warn',
      message: info
    })
  }
}
