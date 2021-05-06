const fs = require('fs')
const url = require('url')

const api = require('./api.js')

// 常用mime
const mime = {
    html: 'text/html',
    text: 'text/plain',
    jpg: 'image/jpeg',
    png: 'image/png',
    css: 'text/css',
    js: 'text/javascript',
}
function getMimeType(fileName) {
    return mime[ fileName.split('.').pop() ] || mime.text
}

// 使用内存缓存文件
let fileCaches = {}
function readFile(fileName, useCache) {
    if(fileCaches.hasOwnProperty(fileName)) {
        return fileCaches[fileName]
    }
    let content = fs.readFileSync(fileName)
    if (useCache) {
        fileCaches[fileName] = content
    }
    return content
}

function router(req, res) {
    let urlObj = url.parse(req.url, true);
    
    let pathName = urlObj.pathname

    // 处理已注册的路由
    for(let i = 0, len = api.length; i < len; i++) {
        if (new RegExp(api[i].url).test(pathName)) {
            api[i].handler(req, res, urlObj.query)
            return
        }
    }

    // 处理静态文件
    pathName = pathName === '/' ? '/index.html' : pathName
    
    let fileName = './static' + pathName

    fs.exists(fileName, function(exists) {
        if(!exists) {
            res.writeHeader(404, {
                "Content-Type" : getMimeType(pathName)
            })
            res.end('404')
            return
        }

        // 文件小于128K 才进行缓存
        let stat = fs.statSync(fileName)
        let useCache = stat.size < 131072 // 128 * 1024

        // 请求路径为目录返回403页面
        if(stat.isDirectory()) {
            res.writeHeader(403, {
                "Content-Type" : getMimeType(pathName)
            })
            res.end('403')
            return
        }

        // 返回文件内容
        res.writeHeader(200, {
            "Content-Type" : getMimeType(pathName)
        })
        res.end(readFile(fileName, useCache))
    })
}

module.exports = router