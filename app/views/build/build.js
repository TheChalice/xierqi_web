'use strict';

angular.module('console.build', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/build/build.css'
        ]
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', 'Build', 'GLOBAL', '$ws', function ($scope, $log, $stateParams, BuildConfig, Build, GLOBAL, $ws) {

        //分页
        $scope.grid = {
            page: 1,
            size: GLOBAL.size
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

        //获取buildConfig列表
        var loadBuildConfigs = function() {
            BuildConfig.get(function(data){
                $log.info('buildConfigs', data);
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

        var watchBuildConfigs = function(){
            if (!$ws.available()) {
                $log.info("webSocket is not available");
                return;
            }
            $ws({
                method: "WATCH",
                url: 'wss://lab.asiainfodata.com:8443/oapi/v1/namespaces/datafoundry-test/buildconfigs?watch=true&resourceVersion=8196719&access_token=HlqyWwA-2DuJ4x9Kb2kNQD5nDCGkJRBjkh_sx8MEOug',
                onclose:   function(){
                    $log.info("webSocket close");
                },
                onmessage: function(){
                    $log.info("webSocket message");
                },
                onopen:    function(){
                    $log.info("webSocket open");
                }
            }).then(function(ws) {
                $log.info("finish ws=", ws);
            });
        };

        //watchBuildConfigs();
        loadBuildConfigs();

        $scope.refresh = function(){
            loadBuildConfigs();
        };

        $scope.build = {
            metadata: {
                name: 'build-2',
                labels: {
                    buildconfig: 'build-config-1'
                }
            },
            spec: {
                strategy: {
                    type: 'Docker',
                    dockerStrategy: {
                        from: {
                            kind: 'ImageStreamTag',
                            name: 'golang:1.5'
                        }
                    }
                },
                source: {
                    type: 'Git',
                    git: {
                        uri: 'https://github.com/dragon9783/docker-2048.git',
                        ref: 'master'
                    }
                }
            }
        };

        //开始构建
        $scope.startBuild = function() {
            Build.create({}, $scope.build, function(res){
                $log.info("build", res);
            }, function(res){
                //todo 错误处理代码
                $log.info("[err]", res);
            });
        };

        $scope.stopBuild = function() {
            $log.info("stop build");
        };
    }]);

