const fs = require('fs')
const url = require('url')
// test line
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
function getMimeType(file) {
    let a = file.split('.')
    return mime[a.pop()] || 'text/plain'
}

// 使用内存缓存文件
let caches = {}
function readFile(fileName, use_cache) {
    if(caches.hasOwnProperty(fileName)) {
        return caches[fileName]
    }
    let content = fs.readFileSync(fileName)
    if (false) {
        caches[fileName] = content
    }
    return content
}

function router(req, res) {
    let url_obj = url.parse(req.url, true);
    
    let pathName = url_obj.pathname

    // 处理已注册的路由
    for(let i = 0, len = api.length; i < len; i++) {
        if (new RegExp(api[i].url).test(pathName)) {
            api[i].handler(req, res, url_obj.query)
            return
        }
    }

    // 处理静态文件
    pathName = pathName === '/' ? '/index.html': pathName
    
    let file = './static' + pathName
    let type = getMimeType(pathName)

    fs.exists(file, function(exists) {
        if(!exists) {
            res.writeHeader(404, {
                "Content-Type" : type
            })
            res.write('404')
            res.end()
            return
        }
        let stat = fs.statSync(file)
        // 文件小于128K 才进行缓存
        let use_cache = stat.size < 131072

        // 请求路径为目录返回403页面
        if(stat.isDirectory()) {
            res.writeHeader(403, {
                "Content-Type" : type
            })
            res.write('403')
            res.end()
            return
        }
        // 返回文件内容
        res.writeHeader(200, {
            "Content-Type" : type
        })
        res.end(readFile(file, use_cache))
    })
}


module.exports = router