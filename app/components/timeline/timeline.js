'use strict';

angular.module("console.timeline", [
    {
        files: ['components/timeline/timeline.css']
    }
])

    .directive('cTimeline', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                data: '='
            },
            templateUrl: 'components/timeline/timeline.html',
            controller: ['$scope', '$log', 'Build', 'Confirm', function($scope, $log, Build, Confirm){
                $scope.buildLog = {};
                $scope.collapseLog = {};

                $scope.getLog = function(idx){
                    var o = $scope.data.items[idx];
                    var name = o.metadata.name;
                    $scope.collapseLog[name] = !$scope.collapseLog[name];

                    if (o.status.phase == "Pending") {
                        return;
                    }
                    if ($scope.buildLog[name]) {
                        return;
                    }
                    Build.log.get({name: name}, function(res){
                        $log.info("log", res);
                        $scope.buildLog[name] = res;
                    }, function(res){
                        //todo 错误处理
                        $log.info("err", res);
                    });
                };

                $scope.delete = function(idx){
                    var name = $scope.data.items[idx].metadata.name;
                    Confirm.open("删除构建", "您确定要删除项目吗?", "删除项目将清除项目的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function(){
                        Build.remove({name: name}, function(){
                            $log.info("deleted");
                            for (var i = 0; i < $scope.data.items.length; i++) {
                                if (name == $scope.data.items[i].metadata.name) {
                                    $scope.data.items.splice(i, 1)
                                }
                            }
                        }, function(res){
                            //todo 错误处理
                            $log.info("err", res);
                        });
                    });
                }
            }]
        }
    }]);



