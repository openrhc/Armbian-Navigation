const fs   = require('fs')
const os   = require('os')

const tools = require('./tools.js')
let urls    = require('./data/urls.js')
let user    = require('./data/user.js')
let config  = require('./data/config.js')

// 存放温度列表
let temp = {
    time: [],
    value: []
}

// 获取温度并添加到列表
function setTemp() {
    let date = new Date()
    let h = date.getHours()
    let m = date.getMinutes()
    let t = tools.temp()
    // console.log('当前温度', `${h}:${m}`, t)
    temp.time.push(`${h}:${m}`)
    temp.value.push(t)
    if(temp.time.length > 5) {
        temp.time.shift()
        temp.value.shift()
    }
}

// 监控温度
setInterval(() => {
    setTemp()
}, 5 * 60 * 1000)

setTemp()

const api = [
{
    url: '/login',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        res.end(
            JSON.stringify({
                code: auth ? 0 : -1,
                msg:  auth ? '登录成功' : '登录失败,  账号或密码不正确',
                data: auth ? user : {}
            })
        )
        // console.table(query)
    }
},
{
    // 获取导航列表
    url: '/getUrls',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        res.end(
            JSON.stringify({
                code: 0,
                msg: '获取成功',
                data: urls
            })
        )
        // console.table(urls)
        // console.table({length: urls.length})
    }
},
{
    // 设置某个导航信息
    url: '/setUrl',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        if (!auth) {
            res.end(
                JSON.stringify({
                    code: -1,
                    msg: '您没有权限，请重新登录！'
                })
            )
            return
        }
        // 获取post数据
        let data = []
        req.on('data', chunk => {
            data.push(chunk)
        })
        req.on('end', () => {
            try{
                data = JSON.parse(data)
            }catch(e){
                res.end(
                    JSON.stringify({
                        code: -1,
                        msg: '保存失败' + e
                    })
                )
                console.log(e)
                return
            }
            urls.urls[data.id] = data
            fs.writeFileSync('./data/urls.js', 'module.exports = ' + JSON.stringify(urls))
            
            res.end(
                JSON.stringify({
                    code: 0,
                    msg: '保存成功'
                })
            )
            // console.table(data)
        })
    }
},
{
    // 两个导航互换位置
    url: '/sortUrl',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        if (!auth) {
            res.end(
                JSON.stringify({
                    code: -1,
                    msg: '您没有权限，请重新登录！'
                })
            )
            return
        }
        let id_a = query.a
        let id_b = query.b
        let tmp = urls.urls[id_a]
        urls.urls[id_a] = urls.urls[id_b]
        urls.urls[id_b] = tmp
        urls.urls[id_a].id = id_a
        urls.urls[id_b].id = id_b
        fs.writeFileSync('./data/urls.js', 'module.exports = ' + JSON.stringify(urls))
        res.end(
            JSON.stringify({
                code: 0,
                msg: '排序成功',
                data: urls
            })
        )
    }
},
{
    // 删除导航
    url: '/delUrl',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        if (!auth) {
            res.end(
                JSON.stringify({
                    code: -1,
                    msg: '您没有权限，请登录后操纵！'
                })
            )
            return
        }
        // console.table(urls[query.id])
        urls.urls.splice(query.id, 1)
        fs.writeFileSync('./data/urls.js', 'module.exports = ' + JSON.stringify(urls))
        res.end(
            JSON.stringify({
                code: 0,
                msg: '删除成功'
            })
        )
    }
},
{
    // 获取系统信息
    url: '/getSys',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })

        // 过滤网卡
        let list = ['wlan', 'wlan0', 'eth', 'eth0']
        let ip = []
        const nws = os.networkInterfaces()
        for(let k in nws) {
            if( list.includes(k.toLowerCase()) ) {
                for(let i in nws[k]) {
                    if (nws[k][i].family == 'IPv4') {
                        ip.push(nws[k][i].address)
                    }
                }
            }
        }
        const data = {
            '主机名': os.hostname(),
            '版本': os.version(),
            '平台': os.type() + ' ' + os.arch(),
            '内存': ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + 'GB / ' + (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            'CPU': '(' + os.cpus().length + ') @ ' + (os.cpus()[0].speed / 1024).toFixed(2) + 'GHz',
            '温度': tools.temp() + '°C',
            'IP': ip.join(' '),
            '负载': os.loadavg().join(' '),
        }
        res.end(
            JSON.stringify({
                code: 0,
                msg: '查询成功',
                data: data
            })
        )
        // console.table(data)
    }
},
{
    // 更新用户信息
    url: '/setUser',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        if (!auth) {
            res.end(
                JSON.stringify({
                    code: -1,
                    msg: '您没有权限，请重新登录！'
                })
            )
            return
        }

        // 获取post数据
        let data = []
        req.on('data', chunk => {
            data.push(chunk)
        })
        req.on('end', () => {
            try{
                data = JSON.parse(data)
            }catch(e){
                console.log(e)
                res.end(
                    JSON.stringify({
                        code: -1,
                        msg: '更新失败' + e
                    })
                )
                return
            }
            user = data
            fs.writeFileSync('./data/user.js', 'module.exports = ' + JSON.stringify(data))
            res.end(
                JSON.stringify({
                    code: 0,
                    msg: '保存成功'
                })
            )
            // console.table(data)
        })
    }
},
{
    // 获取网站配置
    url: '/getConfig',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        res.end(
            JSON.stringify({
                code: 0,
                msg: '获取成功',
                data: config
            })
        )
        // console.table(config)
    }
},
{
    // 设置网站配置
    url: '/setConfig',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = tools.checkLogin(user, query)
        if (!auth) {
            res.end(
                JSON.stringify({
                    code: -1,
                    msg: '您没有权限，请重新登录！'
                })
            )
            return
        }
        // 获取post数据
        let data = []
        req.on('data', chunk => {
            data.push(chunk)
        })
        req.on('end', () => {
            try{
                data = JSON.parse(data)
            }catch(e){
                console.log(e)
                res.end(
                    JSON.stringify({
                        code: -1,
                        msg: '保存失败' + e
                    })
                )
                return
            }
            config = data
            fs.writeFileSync('./data/config.js', 'module.exports = ' + JSON.stringify(data))
            
            res.end(
                JSON.stringify({
                    code: 0,
                    msg: '保存成功'
                })
            )
            // console.table(data)
        })
    }
},
{
    // 获取温度
    url: '/getTemp',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        res.end(
            JSON.stringify({
                code: 0,
                msg: '获取成功',
                data: temp
            })
        )
        // console.table(temp)
    }
}
]

module.exports = api