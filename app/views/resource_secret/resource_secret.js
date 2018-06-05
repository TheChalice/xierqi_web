'use strict';
angular.module('console.resource_management', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/resource_persistentVolume/resource_persistentVolume.css'
        ]
    }
])
    .controller('resourceSecret', ['$log', 'Ws', 'DeploymentConfig', 'persistent', '$state', '$rootScope', '$scope', 'configmaps', 'secretskey',
        function ($log, Ws, DeploymentConfig, persistent, $state, $rootScope, $scope, configmaps, secretskey) {
            $scope.secrets = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.loadsecrets = function () {
                secretskey.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
                    if (res.items && res.items.length > 0) {
                        angular.forEach(res.items, function (item, i) {
                            res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                        })
                        res.items.sort(function (x, y) {
                            return x.sorttime > y.sorttime ? -1 : 1;
                        });
                        if (res.items) {
                            $scope.secretdata = res.items;
                        } else {
                            $scope.secretdata = []
                        }
                        $scope.copysecretdata = angular.copy($scope.secretdata);
                        $scope.secrets.total = $scope.secretdata.length;
                        $scope.secrets.page = 1;
                        $scope.secrets.txt = '';
                        secretrefresh(1);
                    }

                })
            }
            $scope.secretReload=function(){
                $scope.loadsecrets();
            }
            $scope.loadsecrets();

            $scope.$watch('secrets.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    secretrefresh(newVal);
                }
            });

            var secretrefresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.secrets.size;
                $scope.secretitems = $scope.secretdata.slice(skip, skip + $scope.secrets.size)||[];
                //$scope.secrets.total = $scope.secretitems.length;
            };
            $scope.text=' 当前列表暂时没有数据';
            $scope.scretssearch = function (event) {
                if (true) {
                    if (!$scope.secrets.txt) {
                        $scope.secretdata = angular.copy($scope.copysecretdata);
                        secretrefresh(1);
                        $scope.secrets.total = $scope.secretdata.length;
                        return;
                    }
                    $scope.secretdata = [];

                    var iarr = [];
                    var str = $scope.secrets.txt;
                    str = str.toLocaleLowerCase();
                    //console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.copysecretdata, function (item, i) {
                        //console.log(item.build);
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                        if (nstr.indexOf(str) !== -1) {
                            iarr.push(item)
                        }
                    })
                    $scope.isQuery=false;
                    if(iarr.length===0){
                        $scope.isQuery=true;
                        $scope.text='没有查询到符合条件的数据';
                        // console.log($scope.items.length);
                    }
                    else{
                        $scope.text='您还没有任何密钥卷数据，现在就创建一个吧';
                    }
                    $scope.secretdata=angular.copy(iarr);
                    secretrefresh(1);
                    //console.log('$scope.data', $scope.secretdata);
                    $scope.secrets.total = $scope.secretdata.length;
                }

            };
        }])