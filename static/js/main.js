/*
 * 深拷贝
 */
function deepCopy(obj){
    let objClone = Array.isArray(obj) ? [] : {}
    if(obj && typeof obj === 'object'){
        for(key in obj){
            if(obj.hasOwnProperty(key)){
                if(obj[key] && typeof obj[key] === 'object'){
                    objClone[key] = deepCopy(obj[key]);
                }else{
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
} 

function _index(el) {
    let index = 0;
    if (!el || !el.parentNode) {
        return -1;
    }
    while (el && (el = el.previousElementSibling)) {
        index++;
    }
    return index;
}

const app = new Vue({
    el: '#app',
    data: {
        // 当前路由
        route: '/home',
        // 网站配置
        config: {
            title: 'Armbian-Navigation',
            copyright: '©2021 OPENRHC 版权所有 <a target="_blank" href="https://github.com/openrhc/Armbian-Navigation">@项目地址</a>'
        },
        // 网站编辑框的值
        config_editor: {},
        // 用户状态
        user: {
            status: 0,
            username: 'admin',
            password: 'admin',
            nickname: '游客',
            avatar: 'img/avatar-default.png'
        },
        // 个人信息框的值
        user_editor:{},
        // 系统信息
        sys: {
            "主机名": "loading",
            "版本": "loading",
            "平台": "loading",
            "内存": "loading",
            "CPU": "loading",
            "温度": "loading",
            "IP": "loading",
            "负载": 'loading'
        },
        // 导航列表及类别
        urls: {
            urls: [],
            category: []
        },
        // 导航编辑框值
        editor: {
            id: 0,
            icon: '',
            name: '',
            desp: '',
            url: '',
            icon: '',
            category: '1'
        },
        // 提示信息
        message: {
            status: 0,
            type: '',
            content: '',
            timer: undefined
        },
        // 温度图标ID
        temp_id: 'tempEchart'

    },
    methods: {
        getTemp() {
            axios.get('/getTemp').then(res => {
                if(res.data.code == 0) {
                    let myChart = echarts.init(document.getElementById(this.temp_id))
                    let option = {
                        xAxis: {
                            type: 'category',
                            data: res.data.data.time
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                            data: res.data.data.value,
                            type: 'line'
                        }]
                    }
                    myChart.setOption(option)
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '获取温度失败' + err)
            })
        },
        checkUserView() {
            this.redirectTo(this.user.status === 0 ? '/login' : '/profile')
        },
        userLogin() {
            if(!this.user.username || !this.user.password) {
                this.showMessage(-1, '请填写 [用户名] [密码]')
                return
            }
            axios.get(`/login?username=${this.user.username}&password=${this.user.password}`)
            .then(res => {
                if(res.data.code == 0) {
                    this.user = res.data.data
                    this.user_editor = deepCopy(this.user)
                    window.localStorage.setItem('user', JSON.stringify(this.user))
                    console.log('登录成功')
                    this.showMessage(0, '欢迎你，' + this.user.nickname + '！')
                    this.redirectTo('/home')
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '登录失败:' + err)
            })
        },
        userLogout() {
            window.localStorage.removeItem('user')
            this.user = {
                status: 0,
                username: '',
                password: '',
                nickname: '未登录',
                avatar: 'img/avatar-default.png'
            }
            this.user_editor = deepCopy(this.user)
            console.log('退出登录')
            this.showMessage(0, '退出登录')
            this.redirectTo('/login')
        },
        checkEdit() {
            if(!this.editor.name || !this.editor.url ) {
                this.showMessage(-1, '请填写 [名称] [URL]')
                return
            }
            let id = this.editor.id
            if (id == this.urls.urls.length) {
                this.editor.id = this.urls.urls.length
                this.editor.icon = this.editor.icon || 'img/icon-default.png'
            }
            console.log('   check:', id)
            this.setUrl(id)
        },
        // 重定向
        redirectTo(url) {
            window.location.hash = url
        },
        getSys() {
            axios.get('/getSys')
            .then(res => {
                if(res.data.code == 0) {
                    this.sys = res.data.data
                }
                console.log(res.data.msg)
            })
        },
        getUrls() {
            axios.get('/getUrls')
            .then(res => {
                if(res.data.code == 0) {
                    this.urls = res.data.data
                    window.localStorage.setItem('urls', JSON.stringify(res.data.data))
                    this.addDragListener()
                }
                console.log(res.data.msg)
            })
        },
        setUrl() {
            axios.post(`/setUrl?username=${this.user.username}&password=${this.user.password}`, this.editor)
            .then(res => {
                if(res.data.code == 0) {
                    console.log('   save:', this.editor.id)
                    this.showMessage(0, res.data.msg)
                    this.redirectTo('/home')
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '保存失败:' + err)
            })
        },
        delUrl() {
            axios.get(`/delUrl?username=${this.user.username}&password=${this.user.password}&id=${this.editor.id}`)
            .then(res => {
                if(res.data.code == 0) {
                    this.showMessage(0, res.data.msg)
                    this.redirectTo('/home')
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '删除失败:' + err)
            })
        },
        sortUrl(a, b) {
            axios.get(`/sortUrl?username=${this.user.username}&password=${this.user.password}&a=${a}&b=${b}`)
            .then(res => {
                if(res.data.code == 0) {
                    this.showMessage(0, res.data.msg)
                    this.getUrls()
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '排序失败:' + err)
            })
        },
        getConfig() {
            axios.get('/getConfig')
            .then(res => {
                 if(res.data.code == 0) {
                    this.config = res.data.data
                    this.config_editor = deepCopy(this.config)
                    window.localStorage.setItem('config', JSON.stringify(res.data.data))
                    // 设置标题
                    document.title = this.config.title
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '获取网站配置失败:' + err)
            })
        },
        setConfig() {
            axios.post(`/setConfig?username=${this.user.username}&password=${this.user.password}`, this.config_editor)
            .then(res => {
                if(res.data.code == 0) {
                    this.config = deepCopy(this.config_editor)
                    document.title = this.config.title
                    window.localStorage.setItem('config', JSON.stringify(this.config))
                    this.showMessage(0, '更新成功')
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '更新失败:' + err)
            })
        },
        setUser() {
            if (!this.user_editor.username || !this.user_editor.password) {
                this.showMessage(-1, '请填写 [用户名] [密码]')
                return
            }
            axios.post(`/setUser?username=${this.user.username}&password=${this.user.password}`, this.user_editor)
            .then(res => {
                if(res.data.code == 0) {
                    this.user = deepCopy(this.user_editor)
                    window.localStorage.setItem('user', JSON.stringify(this.user))
                    this.showMessage(0, '更新成功')
                    return
                }
                this.showMessage(-1, res.data.msg)
            }).catch(err => {
                this.showMessage(-1, '更新失败' + err)
            })
        },
        showMessage(type, content) {
            clearTimeout(this.message.timer)
            Object.assign(this.message, {
                status: 1,
                type: type,
                content: content
            })
            this.message.timer = setTimeout(() => {
                Object.assign(this.message, {
                    status: 0,
                    type: 0,
                    content: ''
                })
            }, 3000)
        },
        addDragListener() {
            let draging_el = undefined
            let target_el = undefined
            this.$refs['drag-ul'].forEach(ul => {
                ul.ondragstart = (e) => {
                    e.dataTransfer.setData("te", e.target.innerText)
                    draging_el = e.target
                    let i = 3
                    while(draging_el.className != 'drag-li' && i-- > 0) {
                        console.log('寻找')
                        draging_el = draging_el.parentNode
                    }
                    // console.log(draging_el)
                }
                ul.ondragover = (e) => {
                    e.preventDefault()
                    var target = e.target
                    let i = 3
                    while(target.className != 'drag-li' && i-- > 0) {
                        target = target.parentNode
                    }
                    target_el = target
                    // console.log(target_el)
                }
                ul.ondragend = (e) => {
                    if(target_el && target_el !== draging_el && target_el.className == 'drag-li') {
                        // console.log(draging_el)
                        // console.log(target_el)
                        let a = draging_el.dataset.index
                        let b = target_el.dataset.index
                        console.log('   进行排序', a, b)
                        if(this.user.status == 0) {
                            this.showMessage(-1, '请先登录')
                            this.redirectTo('/login')
                            return
                        }
                        this.sortUrl(a, b)
                    }
                } 
            })
        },
        updateView() {
            let hash = window.location.hash;
            hash = hash.replace('#', '');

            // 为空时显示默认路由
            this.route = hash || this.route
            console.log(this.route)

            if (this.route === '/home') {
                this.getUrls()
            }
            if(this.route === '/system') {
                this.getSys()
            }
            if(this.route === '/temp') {
                this.getTemp()
            }
            if (this.route.startsWith('/home/del?id=')) {
                if(this.user.status == 0) {
                    this.showMessage(-1, '请先登录')
                    this.redirectTo('/login')
                    return
                }
                let id = this.route.replace('/home/del?id=', '')
                this.editor.id = id
                console.log('   del:', id)
            }
            if (this.route.startsWith('/home/edit?id=')) {
                if(this.user.status == 0) {
                    this.showMessage(-1, '请先登录')
                    this.redirectTo('/login')
                    return
                }
                let id = this.route.replace('/home/edit?id=', '')
                console.log('   edit:', id)
                if (id == this.urls.urls.length) {
                    this.editor = {
                        id: this.urls.urls.length,
                        icon: '',
                        name: '',
                        desp: '',
                        url: '#/home/edit?id=' + this.urls.urls.length,
                        icon: '',
                        category: '1'
                    }
                    return
                }
                this.editor = {
                    id: id,
                    icon: this.urls.urls[id].icon,
                    name: this.urls.urls[id].name,
                    desp: this.urls.urls[id].desp,
                    url: this.urls.urls[id].url,
                    icon: this.urls.urls[id].icon,
                    category: this.urls.urls[id].category
                }
            }
        }
    },
    mounted() {
        document.getElementById('loading').remove()
        document.getElementById('app').style.visibility = 'visible'
        // 加载本地存储
        let user = window.localStorage.getItem('user')
        let urls = window.localStorage.getItem('urls')
        let config = window.localStorage.getItem('config')
        if (user) {
            this.user = JSON.parse(user)
            this.user_editor = deepCopy(this.user)
            this.userLogin()
        }else{
            this.showMessage(0, '欢迎你，' + this.user.nickname + '！')
        }
        if(urls) {
            this.urls = JSON.parse(urls)
        }
        if(config) {
            this.config = JSON.parse(config)
        }
        this.config_editor = deepCopy(this.config)
        // 设置标题
        document.title = this.config.title
        this.updateView()
        // 路由
        window.onhashchange = () => {
            this.updateView()
        }
        this.getConfig()
    }
})