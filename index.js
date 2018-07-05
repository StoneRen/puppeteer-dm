const puppeteer = require('puppeteer')

const { log, warn } = require('./log')
const DB = require('./db')
const db = new DB()
const fs = require('fs')
const config = require('./config')

const url = 'http://icid.iachina.cn/?columnid_url=201509301401'

async function main() {
  const browser = await puppeteer.launch({
    executablePath: config.chromePath,
    timeout: config.timeout,
    headless: !config.debug
  })
  log(new Date().toLocaleString())
  log('启动服务')

  const page = await browser.newPage()
  await page.setViewport({ width: 1440, height: 680 })
  await page.goto(url)

  log('页面初次加载完毕')
  let data = {
    company: [],
    product: []
  }
  let index = config.startIndex
  let companyListLen = 0
  let tryCount = 0

  const handleCompany = async tryCount => {
    if (tryCount && tryCount > 10) {
      warn('大于重试次数,跳过')
      ++index
      handleCompany(tryCount++)
    }
    try {
      await page.goto(url)
      await page.waitForSelector('.ge ul li a')
      let companyListEl = await page.$$('.ge ul li a')
      companyListLen = companyListEl.length
      log(`进度 ${index + 1}/${companyListLen}`)
      let companyEl = companyListEl[index]
      if (!companyEl) {
        log(`抓取结束`)
        await page.waitFor(1000)
        await browser.close()
        saveData()
        return
      }
      companyEl.click()
      await page.waitForSelector('.di dd a')
      let companyName = await page.evaluate(() => {
        let el = document.querySelector('.kk')
        let name = el.innerText
        return name
      })
      // 保存公司信息
      // data.company.push({
      //   id: index + 1,
      //   name: companyName
      // })
      log(`开始获取 ${companyName} 信息`)
      let detailEl = await page.$$('.di dd a')
      if (detailEl[2]) {
        detailEl[2].click()
      } else {
        detailEl[0].click()
      }
      try {
        await page.waitForSelector('.gengduo')
        let moreEl = await page.$('.gengduo')
        moreEl.click()
        await page.waitFor(1000)
        let productList = await page.evaluate(
          (index, companyName) => {
            let elList = [...document.querySelectorAll('.ge ul li')]
            let _data = []
            elList.forEach(el => {
              let _elList = el.querySelectorAll('p a')
              _data.push({
                cid: index + 1,
                cname: companyName,
                fname: _elList[0].innerText,
                bname: _elList[1].innerText,
                code: _elList[2].innerText
              })
            })
            return _data
          },
          index,
          companyName
        )
        log(`${companyName} 信息获取完毕`)
        ++index
        data.product = data.product.concat(productList)
        handleCompany()
      } catch (error) {
        warn(error)
        // 有的公司没有产品详情信息
        warn(`${companyName} 发生问题`)
        ++index
        handleCompany(tryCount++)
      }
    } catch (error) {
      warn('出错重试')
      warn(error)
      handleCompany(tryCount++)
    }
  }

  const saveData = async () => {
    log('开始存储')
    db.data(data.product, {
      fields: [
        {
          label: '保险公司',
          value: 'cname'
        },
        {
          label: '保险公司编码',
          value: 'cid'
        },
        {
          label: '实际销售名称',
          value: 'fname'
        },
        {
          label: '备案产品名称',
          value: 'bname'
        },
        {
          label: '备案编号/批复文号',
          value: 'code'
        }
      ]
    }).save()
    log(`数据已经存储`)
    log(`工作结束 ${new Date().toLocaleString()}`)
  }

  handleCompany()
}

main()
