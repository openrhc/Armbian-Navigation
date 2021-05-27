const http   = require('http')

const tools  = require('./tools.js')
const router = require('./router.js')

const host   = '0.0.0.0'
const port   = 80
let   index  = 0

const server = http.createServer(function(req, res) {
    let id   = tools.color('magenta', ++index)
    let ip   = tools.color('green',   tools.getClientIp(req))
    let time = tools.color('yellow',  tools.formatTime(new Date()))
    console.log(`[${id}] [${ip}] [${time}] `, req.url)
    router(req, res)
})

server.listen(port, host, () => {
    console.log(tools.color('green', `
      _   _             _             _   _             
     | \ | |           (_)           | | (_)            
     |  \| | __ ___   ___  __ _  __ _| |_ _  ___  _ __  
     | . · |/ _· \ \ / / |/ _· |/ _· | __| |/ _ \| '_ \ 
     | |\  | (_| |\ V /| | (_| | (_| | |_| | (_) | | | |
     |_| \_|\__,_| \_/ |_|\__, |\__,_|\__|_|\___/|_| |_|
                           __/ |                        
                          |___/                         
     GitHub: https://github.com/openrhc/Armbian-Navigation
    `))
    console.log('Server running at', tools.color('green', `http://localhost:${port}/`))
});