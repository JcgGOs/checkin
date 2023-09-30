/*
cron "0 9 * * *" autoSignin.js, tag=阿里云盘签到
*/

const axios = require('axios')
const { initInstance, getEnv } = require('./ql.js')
const notify = require('./sendNotify.js')

// checkin
function checkIn(host, cookie) {
  var requestURL = "https://" + host + "/attendance.php"
  console.info("requestURL:" + requestURL)

  return axios(requestURL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookie,
    },
  })
    .then(resp => {
      return Promise.resolve(resp.status + " [" + host + "]")
    })
    .catch(e => {
      console.info(e)
      return Promise.resolve("500 [" + host + "]")
    })
}

// 获取环境变量
async function getPTSites() {
  try {
    let instance = await initInstance()
    if (instance) {
      let sites = await getEnv(instance, 'PT_SITE')
      return sites.map((env) => {
        let array = env.value.split('#')
        return {
          "host": array[0],
          "cookie": array[1],
        }
      })
    }
  } catch (e) {
    console.info(e)
    return []
  }
}

!(async () => {
  const messages = []
  let sites = await getPTSites()
  for (let index = 0; index < sites.length; index++) {
    const e = sites[index];
    let result = await checkIn(e.host, e.cookie)

    //log
    messages.push(result)
    console.info("checkin:" + result)
  }

  await notify.sendNotify(`PT签到`, messages.join('\n'))
})()
