const Json2csvParser = require('json2csv').Parser
const fs = require('fs')
const dayjs = require('dayjs')
const date = dayjs().format('YYYY_MM_DD')
class CSV {
  data(json, opts) {
    this.opts = opts || {}
    this.json2csvParser = new Json2csvParser(this.opts)
    this.csv = this.json2csvParser.parse(json || {})
    return this
  }
  show() {
    console.log(this.csv)
    return this
  }
  save(p) {
    let _p = p || `./data/${date}.csv`
    let data = this.csv
    try {
      fs.writeFileSync(_p, data, {
        encoding: 'utf8'
      })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = CSV
