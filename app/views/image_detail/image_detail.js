'use strict';

angular.module('console.image_detail', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/timeline/timeline.js',
                'views/image_detail/image_detail.css'
            ]
        }
    ])
    .controller('ImageDetailCtrl', ['$scope', '$log', 'ImageStreamTag', '$stateParams', 'Build', 'Sort', function ($scope, $log, ImageStreamTag, $stateParams, Build, Sort) {
        $log.info('ImageDetailCtrl');

        var loadImageDetail = function(){
            //传imagename的参数
            ImageStreamTag.get({name: $stateParams["name"]}, function(data){
                $log.info('data',data);
                $scope.data = data;

                var gitUrl = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.source-location'];
                var ref = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];

                var matches = gitUrl.match(/^https:\/\/github.com\/([^/]+)\/(.+)\.git$/);
                console.log('matches', matches);
                if(matches){
                    loadReadme(matches[1], matches[2], ref);
                }
            }, function(res){
                //todo 错误处理
            });
        };

        loadImageDetail();

        var loadBuildHistory = function () {
            console.log("bc", $stateParams.bc);
            Build.get({labelSelector: 'buildconfig=' + $stateParams['bc']}, function(data){
                $log.info("history", data);
                var items = [];
                for (var i = 0; i < data.items.length; i++) {
                    if (data.items[i].status.phase == 'Complete') {
                        items.push(data.items[i]);
                    }
                }

                $scope.history = {items: Sort.sort(items, -1)}; //排序
                console.log('===', $scope.history)
            }, function(res){
                //错误处理
            });
        };

        loadBuildHistory();

        var loadReadme = function(owner, repo, ref) {
            var url = 'https://raw.githubusercontent.com/'+ owner +'/'+ repo +'/'+ ref +'/README.md';
            $.get(url, function(data){
                $scope.readme = data;
                $scope.$apply();
            });
        };
    }]);