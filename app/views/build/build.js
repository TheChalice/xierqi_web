'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', 'Build', function ($scope, $log, $stateParams, BuildConfig, Build) {

        var loadBuildConfigs = function() {
            BuildConfig.get(function(data){
                $log.info('buildConfigs', data);
                $scope.data = data;

                loadBuilds($scope.data.items);
            }, function(res) {
                //错误处理
            });
        };

        loadBuildConfigs();

        //todo continue
        var loadBuilds = function(items){
            var labelSelector = '';
            for (var i = 0; i < items.length; i++) {
                labelSelector += 'buildconfig=' + items[i].metadata.labels['buildconfig'] + ','
            }
            labelSelector = labelSelector.substring(0, labelSelector.length - 1);
            Build.get({labelSelector: labelSelector}, function (data) {
                $log.info("builds", data);
            });
        };

        $scope.refresh = function(){
            loadBuilds();
        };
    }]);

