const http = require('http')

const router = require('./router.js')

// 请求次数统计
let count = 0

const server = http.createServer(function(req, res) {
    console.log(`[${++count}]`, req.url)
    router(req, res)
})

const host = '0.0.0.0'
const port = 80

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});