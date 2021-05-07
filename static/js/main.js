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
            username: '',
            password: '',
            nickname: '未登录',
            avatar: 'img/avatar-default.png'
        },
        // 个人信息框的值
        user_editor:{},
        // 系统信息
        sys: {
            "主机名": "loading",
            "内存": "loading",
            "版本": "loading",
            "平台": "loading",
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
        }

    },
    methods: {
        checkUserView() {
            this.redirectTo(this.user.status === 0 ? '/login' : '/profile')
        },
        userLogin() {
            if(!this.user.username || !this.user.password) {
                alert('请填写 [用户名] [密码]')
                return
            }
            axios.get(`/login?username=${this.user.username}&password=${this.user.password}`)
            .then(res => {
                if(res.data.code == 0) {
                    this.user = res.data.data
                    this.user_editor = deepCopy(this.user)
                    window.localStorage.setItem('user', JSON.stringify(this.user))
                    this.redirectTo('/home')
                    console.log('登录成功')
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('登录失败' + err)
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
            this.redirectTo('/login')
        },
        checkEdit() {
            if(!this.editor.name || !this.editor.url ) {
                alert('请填写 [名称] [URL]')
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
                }
                console.log(res.data.msg)
            })
        },
        setUrl() {
            axios.post(`/setUrl?username=${this.user.username}&password=${this.user.password}`, this.editor)
            .then(res => {
                if(res.data.code == 0) {
                    this.redirectTo('/home')
                    console.log('   save:', this.editor.id)
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('保存失败' + err)
            })
        },
        delUrl() {
            axios.get(`/delUrl?username=${this.user.username}&password=${this.user.password}&id=${this.editor.id}`)
            .then(res => {
                if(res.data.code == 0) {
                    this.redirectTo('/home')
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('删除失败' + err)
            })
        },
        getConfig() {
            axios.get('/getConfig')
            .then(res => {
                 if(res.data.code == 0) {
                    this.config = res.data.data
                    this.config_editor = deepCopy(this.config)
                    window.localStorage.setItem('config', JSON.stringify(res.data.data))
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('获取网站配置失败' + err)
            })
        },
        setConfig() {
            axios.post(`/setConfig?username=${this.user.username}&password=${this.user.password}`, this.config_editor)
            .then(res => {
                if(res.data.code == 0) {
                    this.config = deepCopy(this.config_editor)
                    document.title = this.config.title
                    window.localStorage.setItem('config', JSON.stringify(this.config))
                    alert('更新成功')
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('更新失败' + err)
            })
        },
        setUser() {
            if (!this.user_editor.username || !this.user_editor.password) {
                alert('请填写 [用户名] [密码]')
                return
            }
            axios.post(`/setUser?username=${this.user.username}&password=${this.user.password}`, this.user_editor)
            .then(res => {
                if(res.data.code == 0) {
                    this.user = deepCopy(this.user_editor)
                    window.localStorage.setItem('user', JSON.stringify(this.user))
                    alert('更新成功')
                    return
                }
                alert(res.data.msg)
            }).catch(err => {
                alert('更新失败' + err)
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
            if (this.route.startsWith('/home/del?id=')) {
                if(this.user.status == 0) {
                    this.redirectTo('/login')
                    return
                }
                let id = this.route.replace('/home/del?id=', '')
                this.editor.id = id
                console.log('   del:', id)
            }
            if (this.route.startsWith('/home/edit?id=')) {
                if(this.user.status == 0) {
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