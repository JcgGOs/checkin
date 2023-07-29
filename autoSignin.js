/*
cron "0 9 * * *" autoSignin.js, tag=阿里云盘签到
*/

const axios = require('axios')
const { initInstance, getEnv } = require('./qlApi.js')

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
      return Promise.resolve("[" + resp.status + "] checkin [" + host + "] successfully")
    })
    .catch(e => {
      return Promise.resolve("[" + e.response.status + "] checkin [" + host + "] fail")
    })
}

// 获取环境变量
async function getPTSites() {
  try {
    let instance = await initInstance()
    if (instance) {
      let sites = await getEnv(instance, 'PT_SITE')
      console.info(sites)
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
  let sites = await getPTSites()
  for (let index = 0; index < sites.length; index++) {
    const e = sites[index];
    let result = await checkIn(e.host, e.cookie)
    console.info("checkin:" + result)
  }
})()
