const fs   = require('fs')

// 缓存以读取的文件内容
let fileCaches = {}

// 常用MIME
const MIME = {
    text : 'text/plain',
    htm : 'text/html',
    html : 'text/html',
    jpg  : 'image/jpeg',
    png  : 'image/png',
    css  : 'text/css',
    js   : 'text/javascript'
}

// 颜色格式
const colors = {
    'bright'    : '\x1B[1m',  // 亮色
    'grey'      : '\x1B[2m',  // 灰色
    'italic'    : '\x1B[3m',  // 斜体
    'underline' : '\x1B[4m',  // 下划线
    'reverse'   : '\x1B[7m',  // 反向
    'hidden'    : '\x1B[8m',  // 隐藏
    'black'     : '\x1B[30m', // 黑色
    'red'       : '\x1B[31m', // 红色
    'green'     : '\x1B[32m', // 绿色
    'yellow'    : '\x1B[33m', // 黄色
    'blue'      : '\x1B[34m', // 蓝色
    'magenta'   : '\x1B[35m', // 品红
    'cyan'      : '\x1B[36m', // 青色
    'white'     : '\x1B[37m', // 白色
    'blackBG'   : '\x1B[40m', // 背景色为黑色
    'redBG'     : '\x1B[41m', // 背景色为红色
    'greenBG'   : '\x1B[42m', // 背景色为绿色
    'yellowBG'  : '\x1B[43m', // 背景色为黄色
    'blueBG'    : '\x1B[44m', // 背景色为蓝色
    'magentaBG' : '\x1B[45m', // 背景色为品红
    'cyanBG'    : '\x1B[46m', // 背景色为青色
    'whiteBG'   : '\x1B[47m'  // 背景色为白色
}

/*
 * 获取客户端IP
 */
function getClientIp(req) {
    try{
        return req.headers['x-forwarded-for']
        || req.connection.remoteAddress
        || req.socket.remoteAddress
        || req.connection.socket.remoteAddress
    }catch(e){
        return 'Unknow IP'
    }
}

/*
 * 格式化时间
 */
function formatTime(date) {
    return date.getFullYear() + '-'
        + (date.getMonth() + 1) + '-'
        + date.getDate() + ' '
        + date.getHours() + ':'
        + date.getMinutes() + ':'
        + date.getSeconds()
}

/*
 * 返回带颜色的字符串
 */
function color(color, text) {
    return colors[color] + text + '\x1B[0m'
}

/*
 * 返回文件的MIME
 */
function getMimeType(file) {
    return MIME[ file.split('.').pop() ] || MIME.text
}

/*
 * 读取文件内容
 */
function readFile(fileName, useCache) {
    if(fileCaches.hasOwnProperty(fileName)) {
        return fileCaches[fileName]
    }
    let content = fs.readFileSync(fileName)
    if (false) {
        fileCaches[fileName] = content
    }
    return content
}

/*
 * 登录检测
 */
function checkLogin(user, query) {
    return user.username === query.username
    && user.password === query.password
}

exports.color       = color
exports.readFile    = readFile
exports.formatTime  = formatTime
exports.getClientIp = getClientIp
exports.getMimeType = getMimeType
exports.checkLogin  = checkLogin