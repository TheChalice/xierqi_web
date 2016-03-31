'use strict';
angular.module('console.image', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/card/card.js',
                'views/image/image.css'
            ]
        }
    ])
    .controller('ImageCtrl', ['$scope', '$log','ImageStreamTag', 'Build', 'GLOBAL', function ($scope, $log, ImageStreamTag, Build, GLOBAL) {

        //分页
        $scope.grid = {
            page: 1,
            size: GLOBAL.size
        };

        $scope.gitStore = {};   //存储commit id 和 分支,angular修改数组内元素属性不能触发刷新

        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });

        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.items = $scope.data.items.slice(skip, skip + $scope.grid.size);
            fillImageStreams($scope.items);
        };

        var loadImageStream = function() {
            ImageStreamTag.get(function(data){
                $log.info('imageStream', data);
                $scope.data = data;
                $scope.grid.total = data.items.length;
                refresh(1);

            }, function (res) {
                //错误处理
            });
        };

        loadImageStream();

        var fillImageStreams = function(items) {
            angular.forEach(items, function(item){
                if ($scope.gitStore[item.metadata.name]) {
                    return;
                }
                ImageStreamTag.get({name: item.metadata.name}, function (data) {
                    var labels = data.image.dockerImageMetadata.Config.Labels;
                    if (!labels) {
                        return;
                    }
                    $scope.gitStore[item.metadata.name] = {
                        id: labels["io.openshift.build.commit.id"],
                        ref: labels["io.openshift.build.commit.ref"]
                    };
                });
            });
        };

        $scope.doSearch = function(txt){
            $scope.showTip = false;
            $scope.search(txt);
        }
        $scope.search = function (key, txt) {
            if (!txt) {
                refresh(1);
                return;
            }
            $scope.items = [];
            txt = txt.replace(/\//g, '\\/');
            var reg = eval('/' + txt + '/');
            for(var i=0;i<$scope.data.items.length; i++){
                if (reg.test($scope.data.items[i].metadata.name)) {
                    $scope.items.push($scope.data.items[i]);
                }
            }
            $log.info($scope.items);
            $log.info($scope.data.items[0].metadata.name);
        }
    }]);
