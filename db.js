const Json2csvParser = require('json2csv').Parser
const fs = require('fs')
const dayjs = require('dayjs')
const date = dayjs().format('YYYY_MM_DD')

const saveFile = (filePath, fileData) => {
  if(fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileData, {
      encoding: 'utf8'
    }, err => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}
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
  async save(p) {
    let _p = p || `./data/${date}.csv`
    if (!_p) {
      throw new Error({
        message: '没有指定路径'
      })
    }

    try {
      await saveFile(_p, this.csv) // 这里的fileData是Buffer类型
    } catch (err) {
      console.log(err)
    }
    return this
  }
}

module.exports = CSV
