'use strict';

angular.module('console.build', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/build/build.css'
        ]
    }
])
    .controller('BuildCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', 'BuildConfig', 'Build', 'GLOBAL', 'Confirm', 'Sort', 'Ws', function ($rootScope, $scope, $log, $state, $stateParams, BuildConfig, Build, GLOBAL, Confirm, Sort, Ws) {

        //分页
        $scope.grid = {
            page: 1,
            size: GLOBAL.size,
            txt: ''
        };

        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });

        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.items = $scope.data.items.slice(skip, skip + $scope.grid.size);
        };

        $scope.search = function (key, txt) {
            if (!txt) {
                refresh(1);
                return;
            }
            $scope.items = [];

            txt = txt.replace(/\//g, '\\/');
            var reg = eval('/' + txt + '/');

            angular.forEach($scope.data.items, function(item){
                if (key == 'all') {
                    if (reg.test(item.metadata.name) || reg.test(item.spec.source.git.uri) || (item.metadata.labels && reg.test(item.metadata.labels.build))) {
                        $scope.items.push(item);
                    }
                } else if (key == 'metadata.name') {
                    if (reg.test(item.metadata.name)) {
                        $scope.items.push(item);
                    }
                } else if (key == 'metadata.labels.build') {
                    if (item.metadata.labels && reg.test(item.metadata.labels.build)) {
                        $scope.items.push(item);
                    }
                } else if (key == 'spec.source.git.uri') {
                    if (reg.test(item.spec.source.git.uri)) {
                        $scope.items.push(item);
                    }
                }
            });
            $scope.grid.total = $scope.items.length;
        };

        //获取buildConfig列表
        var loadBuildConfigs = function() {
            BuildConfig.get({namespace: $rootScope.namespace}, function(data){
                $log.info('buildConfigs', data);
                data.items = Sort.sort(data.items, -1); //排序
                $scope.data = data;
                $scope.grid.total = data.items.length;
                refresh(1);

                loadBuilds($scope.data.items);
            }, function(res) {
                //todo 错误处理
            });
        };

        //根据buildConfig标签获取build列表
        var loadBuilds = function(items){
            var labelSelector = '';
            if (items.length > 0) {
                labelSelector = 'buildconfig in (';
                for (var i = 0; i < items.length; i++) {
                    labelSelector += items[i].metadata.name + ','
                }
                labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
            }
            Build.get({namespace: $rootScope.namespace, labelSelector: labelSelector}, function (data) {
                $log.info("builds", data);

                $scope.resourceVersion = data.metadata.resourceVersion;
                watchBuilds(data.metadata.resourceVersion);

                fillBuildConfigs(data.items);
            });
        };

        var watchBuilds = function(resourceVersion){
            Ws.watch({
                resourceVersion: resourceVersion,
                namespace: $rootScope.namespace,
                type: 'builds',
                name: ''
            }, function(res){
                var data = JSON.parse(res.data);
                updateBuildConfigs(data);
            }, function(){
                $log.info("webSocket start");
            }, function(){
                $log.info("webSocket stop");
                var key = Ws.key($rootScope.namespace, 'builds', '');
                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                    return;
                }
                watchBuilds($scope.resourceVersion);
            });
        };

        var updateBuildConfigs = function(data){
            if (data.type == 'ERROR') {
                $log.info("err", data.object.message);
                Ws.clear();
                loadBuilds($scope.data.items);
                return;
            }

            $scope.resourceVersion = data.object.metadata.resourceVersion;
            if (data.type == 'ADDED') {

            } else if (data.type == "MODIFIED") {
                angular.forEach($scope.items, function(item, i){
                    if (!item.build) {
                        return;
                    }
                    if (item.build.metadata.name == data.object.metadata.name) {
                        $scope.items[i].build = data.object;
                    }
                });
              // console.log('$scope.items.build.status.phase',$scope.items);
            }
        };

        //填充buildConfig列表
        var fillBuildConfigs = function(items) {
            var buildMap = {};
            for (var i = 0; i < items.length; i++) {
                if (!items[i].metadata.labels) {
                    continue;
                }
                var label = items[i].metadata.labels.buildconfig;
                if (!buildMap[label]) {
                    buildMap[label] = items[i];
                    continue;
                }
                var st = (new Date(items[i].metadata.creationTimestamp)).getTime();
                if ((new Date(buildMap[label].metadata.creationTimestamp)).getTime() < st) {
                    buildMap[label] = items[i];
                }
            }
            angular.forEach($scope.data.items, function(item){
                var label = item.metadata.name;
                if (!buildMap[label]) {
                    return;
                }
                item.build= buildMap[label];
                //todo 构建类型
            });
        };

        loadBuildConfigs();

        $scope.refresh = function(){
            loadBuildConfigs();
            $scope.grid.page = 1;
        };


        //开始构建
        $scope.startBuild = function(idx) {
            var name = $scope.items[idx].metadata.name;
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({namespace: $rootScope.namespace, name: name}, buildRequest, function(){
                $log.info("build instantiate success");
                $state.go('console.build_detail', {name: name, from: 'create'})
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.stop = function(idx){
            Confirm.open("提示信息","您确定要终止本次构建吗?").then(function(){
                var build = $scope.items[idx].build;
                build.status.cancelled = true;
                Build.put({namespace: $rootScope.namespace, name: build.metadata.name}, build, function(res){
                    $log.info("stop build success");
                    $scope.items[idx].build = res;
                }, function(res){
                    if(res.data.code== 409){
                        Confirm.open("提示信息","当数据正在New的时候,构建不能停止,请等到正在构建时,在请求停止.");
                    }
                });
            });
        };

        $scope.$on('$destroy', function(){
            Ws.clear();
        });
    }]);

