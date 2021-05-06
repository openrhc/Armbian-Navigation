let user = require('./data/user.js')
let config = require('./data/config.js')

function checkLogin(query) {
    return user.username === query.username && user.password === query.password
}

module.exports = [
    {
        // 用户登录
        url: '/login',
        handler: function(req, res, query) {
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            
            let auth = checkLogin(query)
            res.write(
                 JSON.stringify({
                    code: auth ? 0 : -1,
                    msg:  auth ? '登录成功' : '登录失败,  账号或密码不正确',
                    data: auth ? require('./data/user.js') : {}
                })
            )
            res.end()
        }
    },
    {
        // 获取导航列表
        url: '/getUrls',
        handler: function(req, res, query) {
            const urls = require('./data/urls.js')
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            res.write(
                JSON.stringify({
                    code: 0,
                    msg: '获取成功',
                    data: urls
                })
            )
            res.end()
        }
    },
    {
        // 设置某个导航信息
        url: '/setUrl',
        handler: function(req, res, query) {
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            let auth = checkLogin(query)
            if (!auth) {
                res.write(
                    JSON.stringify({
                        code: -1,
                        msg: '您没有权限，请重新登录！'
                    })
                )
                res.end()
                return
            }
            const urls = require('./data/urls.js')
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
                    res.write(
                        JSON.stringify({
                            code: -1,
                            msg: '保存失败' + e
                        })
                    )
                    res.end()
                    return
                }
                console.log('更新URL信息', data)
                urls[data.id] = data
                const fs = require('fs')
                fs.writeFileSync('./data/urls.js', 'module.exports = ' + JSON.stringify(urls))
                
                res.write(
                    JSON.stringify({
                        code: 0,
                        msg: '保存成功'
                    })
                )
                res.end()
            })
        }
    },
    {
        // 删除导航
        url: '/delUrl',
        handler: function(req, res, query) {
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            let auth = checkLogin(query)
            if (!auth) {
                res.write(
                    JSON.stringify({
                        code: -1,
                        msg: '您没有权限，请登录后操纵！'
                    })
                )
                res.end()
                return
            }
            const urls = require('./data/urls.js')
            urls.splice(query.id, 1)
            const fs = require('fs')
            fs.writeFileSync('./data/urls.js', 'module.exports = ' + JSON.stringify(urls))
            
            res.write(
                JSON.stringify({
                    code: 0,
                    msg: '删除成功'
                })
            )
            res.end()
        }
    },
    {
        // 获取系统信息
        url: '/getSys',
        handler: function(req, res, query) {
            const os = require('os')
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            const data = {
                '主机名': os.hostname(),
                '内存': ((os.totalmem() - os.freemem()) / 1024 / 1024 / 1024).toFixed(2) + 'GB / ' + (os.totalmem() / 1024 / 1024 / 1024).toFixed(2) + 'GB',
                '版本': os.version(),
                '平台': os.type() + ' ' + os.arch(),
                '负载': os.loadavg()
            }
            res.write(
                JSON.stringify({
                    code: 0,
                    msg: '查询成功',
                    data: data
                })
            )
            res.end()
        }
    },
    {
        // 更新用户信息
        url: '/updateUser',
        handler: function(req, res, query) {
            const fs = require('fs')
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            
            let auth = checkLogin(query)
            if (!auth) {
                res.write(
                    JSON.stringify({
                        code: -1,
                        msg: '您没有权限，请重新登录！'
                    })
                )
                res.end()
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
                    res.write(
                        JSON.stringify({
                            code: -1,
                            msg: '更新失败' + e
                        })
                    )
                    res.end()
                    return
                }
                console.log('更新用户信息', data)
                user = data
                fs.writeFileSync('./data/user.js', 'module.exports = ' + JSON.stringify(data))
                    res.write(
                        JSON.stringify({
                            code: 0,
                            msg: '保存成功'
                        })
                    )
                res.end()
            })
        }
    },
    {
        // 获取网站配置
        url: '/getConfig',
        handler: function(req, res, query) {
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            res.write(
                JSON.stringify({
                    code: 0,
                    msg: '获取成功',
                    data: config
                })
            )
            res.end()
        }
    },
    {
        // 设置网站配置
        url: '/setConfig',
        handler: function(req, res, query) {
            res.writeHeader(200, {
                "Content-Type" : "application/json"
            })
            let auth = checkLogin(query)
            if (!auth) {
                res.write(
                    JSON.stringify({
                        code: -1,
                        msg: '您没有权限，请重新登录！'
                    })
                )
                res.end()
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
                    res.write(
                        JSON.stringify({
                            code: -1,
                            msg: '保存失败' + e
                        })
                    )
                    res.end()
                    return
                }
                console.log('更新Config信息', data)
                config = data
                const fs = require('fs')
                fs.writeFileSync('./data/config.js', 'module.exports = ' + JSON.stringify(data))
                
                res.write(
                    JSON.stringify({
                        code: 0,
                        msg: '保存成功'
                    })
                )
                res.end()
            })
        }
    },
]