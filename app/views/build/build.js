'use strict';

angular.module('console.build', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/build/build.css'
        ]
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$state', '$stateParams', 'BuildConfig', 'Build', 'GLOBAL', 'Sort', function ($scope, $log, $state, $stateParams, BuildConfig, Build, GLOBAL, Sort) {

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
            if (txt == "") {
                return;
            }
            $scope.items = [];

            txt = txt.replace(/\//g, '\\/');
            var reg = eval('/' + txt + '/');

            angular.forEach($scope.data.items, function(item){
                if (key == 'all') {
                    if (reg.test(item.metadata.name) || reg.test(item.spec.source.git.uri)) {
                        $scope.items.push(item);
                    }
                } else if (key == 'metadata.name') {
                    if (reg.test(item.metadata.name)) {
                        $scope.items.push(item);
                    }
                } else if ('label') {

                } else if ('spec.source.git.uri') {
                    if (reg.test(item.spec.source.git.uri)) {
                        $scope.items.push(item);
                    }
                }
            });
            $scope.grid.total = $scope.items.length;
        };

        //获取buildConfig列表
        var loadBuildConfigs = function() {
            BuildConfig.get(function(data){
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
            //todo 通过labelSelector筛选builds,现在无法拿到数据
            //var labelSelector = '';
            //for (var i = 0; i < items.length; i++) {
            //    labelSelector += 'buildconfig=' + items[i].metadata.name + ','
            //}
            //labelSelector = labelSelector.substring(0, labelSelector.length - 1);
            //Build.get({labelSelector: labelSelector}, function (data) {
            Build.get(function (data) {
                $log.info("builds", data);

                fillBuildConfigs(data.items);
            });
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
                item.status.phase = buildMap[label].status.phase;
                item.status.startTimestamp = buildMap[label].metadata.creationTimestamp;
                item.status.duration = buildMap[label].status.duration;
                //todo 构建类型
            });
        };

        loadBuildConfigs();

        $scope.refresh = function(){
            loadBuildConfigs();
        };

        //开始构建
        $scope.startBuild = function(idx) {
            var name = $scope.items[idx].metadata.name;
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({name: name}, buildRequest, function(){
                $log.info("build instantiate success");
                $state.go('console.build_detail', {name: name})
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.stopBuild = function() {
            $log.info("stop build");
        };
    }]);

