# Armbian-Navigation

使用手册

## 1. 安装 Node.js

已有nodejs环境的请忽略

### 斐讯N1 - Linux Binaries (ARM64)
```bash
wget https://nodejs.org/dist/v14.16.1/node-v14.16.1-linux-arm64.tar.xz
tar xvf node-v14.16.1-linux-arm64.tar.xz
mv node-v14.16.1-linux-arm64 /usr/local/nodejs
ln -s /usr/local/nodejs/bin/* /usr/local/bin
```
### 玩客云 - Linux Binaries (ARM)
```bash
wget https://nodejs.org/dist/v14.16.1/node-v14.16.1-linux-armv7l.tar.xz
tar xvf node-v14.16.1-linux-arm64.tar.xz
mv node-v14.16.1-linux-arm64 /usr/local/nodejs
ln -s /usr/local/nodejs/bin/* /usr/local/bin
```

### 其他平台 - 下载地址

https://nodejs.org/en/download/

## 2. 拉取项目
```bash
git clone https://github.com/openrhc/Armbian-Navigation.git
```

## 3. 运行项目
```bash
cd Armbian-Navigation
node main.js
```

### 目录说明

    ├── LICENSE
    ├── README.md
    ├── api.js
    ├── data
    │   ├── config.js     -- 网站配置
    │   ├── urls.js       -- 导航列表
    │   └── user.js       -- 用户信息
    ├── main.js
    ├── package.json
    ├── router.js
    └── static             -- 静态资源文件
        ├── css
        ├── img
        │   └── icons     -- 导航图标
        ├── index.html
        └── js


### 预览
#### 1.首页
[![gQxdWF.md.png](https://z3.ax1x.com/2021/05/06/gQxdWF.md.png)](https://imgtu.com/i/gQxdWF)

#### 2.系统
[![gQxTeI.md.png](https://z3.ax1x.com/2021/05/06/gQxTeI.md.png)](https://imgtu.com/i/gQxTeI)