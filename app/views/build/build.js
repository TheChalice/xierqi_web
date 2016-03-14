'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', 'Build', function ($scope, $log, $stateParams, BuildConfig, Build) {

        //获取buildConfig列表
        var loadBuildConfigs = function() {
            BuildConfig.get(function(data){
                $log.info('buildConfigs', data);
                $scope.data = data;

                loadBuilds($scope.data.items);
            }, function(res) {
                //错误处理
            });
        };

        //根据buildConfig标签获取build列表
        var loadBuilds = function(items){
            var labelSelector = '';
            for (var i = 0; i < items.length; i++) {
                labelSelector += 'buildconfig=' + items[i].metadata.name + ','
            }
            labelSelector = labelSelector.substring(0, labelSelector.length - 1);
            Build.get({labelSelector: labelSelector}, function (data) {
                $log.info("builds", data);

                fillBuildConfigs(data.items);
            });
        };

        //填充buildConfig列表
        var fillBuildConfigs = function(items) {
            var buildMap = {};
            for (var i = 0; i < items.length; i++) {
                var label = items[i].metadata.labels.buildconfig;
                if (!buildMap[label]) {
                    buildMap[label] = items[i];
                    continue;
                }
                var st = (new Date(items[i].status.startTimestamp)).getTime();
                if ((new Date(buildMap[label].status.startTimestamp)).getTime() < st) {
                    buildMap[label] = items[i];
                }
            }
            angular.forEach($scope.data.items, function(item){
                var label = item.metadata.name;
                if (!buildMap[label]) {
                    return;
                }
                item.status.phase = buildMap[label].status.phase;
                item.status.startTimestamp = buildMap[label].status.startTimestamp;
                item.status.duration = buildMap[label].status.duration;
                //todo 构建类型
            });
        };

        loadBuildConfigs();

        $scope.refresh = function(){
            loadBuilds();
        };
    }]);

