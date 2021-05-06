const fs   = require('fs')
const os   = require('os')

let urls   = require('./data/urls.js')
let user   = require('./data/user.js')
let config = require('./data/config.js')

function checkLogin(query) {
    return user.username === query.username
    && user.password === query.password
}

const api = [
{
    url: '/login',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = checkLogin(query)
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
        let auth = checkLogin(query)
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
            urls[data.id] = data
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
    // 删除导航
    url: '/delUrl',
    handler: (req, res, query) => {
        res.writeHeader(200, {
            "Content-Type" : "application/json"
        })
        let auth = checkLogin(query)
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
        urls.splice(query.id, 1)
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
        let list = ['wlan', 'eth0']
        let ip = []
        const nws = os.networkInterfaces()
        for(let k in nws) {
            if( list.includes(k.toLowerCase()) ) {
                ip.push(nws[k][1].address)
            }
        }
        const data = {
            '主机名': os.hostname(),
            '内存': ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + 'GB / ' + (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
            'CPU': '(' + os.cpus().length + ') @ ' + (os.cpus()[0].speed / 1024).toFixed(2) + 'GHz',
            '版本': os.version(),
            '平台': os.type() + ' ' + os.arch(),
            '负载': os.loadavg().join(' '),
            'IP': ip.join(' ')
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
        let auth = checkLogin(query)
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
        let auth = checkLogin(query)
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
]

module.exports = api