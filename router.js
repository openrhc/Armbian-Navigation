const fs    = require('fs')
const url   = require('url')

const api   = require('./api.js')
const tools = require('./tools.js')

function router(req, res) {
    let urlObj   = url.parse(req.url, true);
    let pathName = urlObj.pathname

    // 处理已注册的路由
    for(let i = 0, len = api.length; i < len; i++) {
        if (new RegExp(api[i].url).test(pathName)) {
            api[i].handler(req, res, urlObj.query)
            return
        }
    }

    // 处理静态文件
    let fileName = pathName === '/' ? '/index.html' : pathName
    let fileMime = tools.getMimeType(fileName)
    fileName = './static' + fileName

    fs.exists(fileName, function(exists) {
        if(!exists) {
            res.writeHeader(404, {
                "Content-Type" : fileMime
            })
            res.end('404')
            return
        }

        // 小于12KB的静态文件使用内存进行缓存
        let stat = fs.statSync(fileName)
        let useCache = stat.size < 131072 // 128 * 1024

        // 请求路径为目录返回403页面
        if(stat.isDirectory()) {
            res.writeHeader(403, {
                "Content-Type" : fileMime
            })
            res.end('403')
            return
        }

        // 返回文件内容
        res.writeHeader(200, {
            "Content-Type" : fileMime
        })
        res.end(tools.readFile(fs, fileName, useCache))
    })
}

module.exports = router