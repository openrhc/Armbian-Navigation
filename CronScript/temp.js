const fs = require('fs')

let date = new Date()

let year = date.getFullYear()
let month = date.getMonth() + 1
let date_ = date.getDate()

let name = `${year}-${month}-${date_}.js`

let debug = !true
let file = ''
let temp = 0

if(debug) {
    file = `E:\\NodejsProject\\Armbian-Navigation\\static\\tempdata\\test.js`
    temp = 38
}else{
    // 改为自己的路径
    file = `/root/Armbian-Navigation/static/tempdata/${name}`
    temp = fs.readFileSync('/etc/armbianmonitor/datasources/soctemp') / 1000
}


if (fs.existsSync(file)) {
    let temps = JSON.parse(fs.readFileSync(file).toString())
    temps.push(temp)
    let str = JSON.stringify(temps)
    fs.writeFileSync(file, str)
}else{
    let temps = [temp]
    console.log(name, '开始记录今日温度')
    fs.writeFileSync(file, `[${temps}]`)
}


console.log('当前温度', temp)
