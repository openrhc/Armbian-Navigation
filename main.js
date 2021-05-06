const http = require('http')

const router = require('./router.js')

// 请求次数统计
let count = 0

// 获取客户端IP
function getClientIp(req) {
    try{
        return req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress
    }catch(err){
        return 'Unknow IP'
    }
}

const server = http.createServer(function(req, res) {
    let ip = getClientIp(req)
    console.log(`[${++count}] [${ip}]`, req.url)
    router(req, res)
})

const host = '0.0.0.0'
const port = 80

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});