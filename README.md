## DataFactory Web

### 文档结构
```
/
    /app                    //应用目录
        /components         //模块目录
            /component1     //模块1
            /component2     //模块2
            ...
        /pub
            controller.js   //全局控制器
            service.js      //全局服务
            filter.js       //全局过滤器
            /tpl            //全局服务使用的模板
        /views              //视图目录
            /view1          //视图1
            /view2          //视图2
            ...
        app.js              //程序入口
        index.html          //页面入口
        main.js             //require配置入口
        router.js           //路由
    /bower_components       //bower依赖包
    /node_modules           //node工具包
    /conf                   //配置文件目录
    .gitignore
    bower.json
    package.json
    README.md
```

### 开始
1. 安装开发工具依赖
```
npm install
```
2. 安装程序依赖
```
bower install
```
3. 启动 http-server (访问：localhost:8080/app)
```
npm run start
```
4. 单元测试
```
npm run test
```
5. 端对端测试
```
npm run update-webdriver    //更新webdriver
npm run protractor          //启动测试
```
5. build
```
npm run build
```
