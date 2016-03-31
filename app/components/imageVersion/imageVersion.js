'use strict';

angular.module("console.imageVersion", [
    {
        files: ['components/imageVersion/imageVersion.css']
    }
])

    .directive('iVersion', [function () {
        return {
            restrict: 'EA',
            replace: true,
            controller: ['$scope', '$log', 'Build', 'Confirm', '$stateParams', function($scope, $log, Build, Confirm, $stateParams){
                $scope.buildLog = {};
                $scope.collapseLog = {};

                //如果构建成功,显示记录
                if(build.get({fieldSelector: 'completed'})){
                    $scope.getLog(0);
                }

                $scope.getLog = function(idx){
                    var o = $scope.data.items[idx];
                    o.showLog = !o.showLog;

                    //if (o.status.phase == "Pending") {
                    //    return;
                    //}
                    //存储已经调取过的log
                    if (o.buildLog) {
                        return;
                    }
                    Build.log.get({name: o.metadata.name}, function(res){
                        var result = "";
                        for(var k in res){
                            result += res[k];
                        }
                        o.buildLog = result;
                    }, function(res){
                        //todo 错误处理
                        $log.info("err", res);
                    });
                };

                $scope.pull = function(idx){
                    //var name = $scope.data.items[idx].metadata.name;
                    comfirm.open("拉取镜像版本:","拉取命令","").then(function(){

                    })
                }
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
                };

                //$scope.stop = function(idx){
                //    var o = $scope.data.items[idx];
                //    o.status.cancelled = true;
                //    Confirm.open("提示信息","您确定要终止本次构建吗?").then(function(){
                //        Build.put({name: o.metadata.name}, o, function(res){
                //            $log.info("stop build success");
                //            $scope.data.items[idx] = res;
                //        }, function(res){
                //            if(res.data.code== 409){
                //                Confirm.open("提示信息","当数据正在New的时候,构建不能停止,请等到正在构建时,在请求停止.");
                //            }
                //        });
                //    });
                //};
            }],
            scope: {
                data: '='
            },
            templateUrl: 'components/timeline/timeline.html'
        }
    }]);



