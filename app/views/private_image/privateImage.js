'use strict';
angular.module('console.private-image', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/image/image.css'
        ]
    }
])
    .filter('imagefilter', function () {
        // 分类过滤器
        return function (items, condition) {
            var filtered = [];
            if (condition === undefined || condition === '') {
                return items;
            }
            if (condition.name === '') {
                return items;
            }
            angular.forEach(items, function (item) {
                if (condition.class === item.class) {
                    filtered.push(item);
                }
            });
            //console.log(filtered);
            return filtered;

        };
    })
    .controller('PrivateImageCtrl', ['registryptag', 'registryp', 'pubregistrytag', 'pubregistry', 'regpro', 'platformone', 'ImageStream', '$filter', '$state', '$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort',
        function (registryptag, registryp, pubregistrytag, pubregistry, regpro, platformone, ImageStream, $filter, $state, $q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
            $scope.fyshow = true;
            $scope.imagecenterDoc = [];
            Array.prototype.unique = function () {
                var res = [this[0]];
                for (var i = 1; i < this.length; i++) {
                    var repeat = false;
                    for (var j = 0; j < res.length; j++) {
                        if (this[i] == res[j]) {
                            repeat = true;
                            break;
                        }
                    }
                    if (!repeat) {
                        res.push(this[i]);
                    }
                }
                return res;
            }
            // 分页对象
            var end = $q.defer();
            $scope.grid = {
                page: 1,
                repertoryspage: 1,
                imagecenterpage: 1,
                ckPage: 1,
                size: 10,
                copytest: {},
                search: false
            };

            $scope.$on('$destroy', function () {
                end.resolve();
            });
            // 存储commit id 和 分支,angular修改数组内元素属性不能触发刷新
            $scope.gitStore = {};
            // 监视分页的页数控制换页
            $scope.$watch('grid.page', function (newVal, oldVal) {
                // console.log(newVal, oldVal);
                if (newVal !== oldVal) {
                    if ($scope.grid.search) {
                        refresh(newVal, 'search');
                    } else {
                        refresh(newVal);
                    }
                }
            });
            // myimage控制换页方法
            var refresh = function (page, type) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                if (type) {
                    $scope.grid.search = true;
                    $scope.testlist = $scope.grid.myimagecopy.slice(skip, skip + $scope.grid.size);
                    // console.log($scope.grid.myimagecopy);
                    $scope.grid.total = $scope.grid.myimagecopy.length;
                } else {
                    $scope.testlist = $scope.testcopy.slice(skip, skip + $scope.grid.size);
                    // console.log($scope.testcopy);
                    $scope.grid.total = $scope.testcopy.length;
                }
            };
            // 在searchbar组件中调用
            $scope.doSearch = function (txt) {
                // 使搜索框失去焦点
                $scope.showTip = false;
                $scope.search(txt);
            }
            // 私有镜像平台键盘搜索
            $scope.text = '您还没有构建镜像';
            $scope.begin_blank = true;
            $scope.search = function (key, txt) {
                // console.log(key,txt);
                $scope.text_seach = txt;
                if (!txt) {
                    $scope.grid.search = false;
                    $scope.uex_back = true;
                    $scope.uex_front = false;
                    $scope.grid.page = 1;
                    console.log($scope.grid.page);
                    refresh(1);
                    return;
                }
                var imagearr = [];
                txt = txt.replace(/\//g, '\\/');
                var reg = new RegExp(txt);
                // var reg = eval('/' + txt + '/');
                if ($scope.testcopy) {
                    for (var i = 0; i < $scope.testcopy.length; i++) {
                        if (reg.test($scope.testcopy[i].metadata.name)) {
                            // console.log($scope.testcopy[i].metadata.name);
                            imagearr.push($scope.testcopy[i]);
                        }
                    }
                }
                if (imagearr.length === 0) {
                    $scope.begin_blank = false;
                    $scope.text = '没有查询到符合条件的数据';
                } else {
                    $scope.text = '您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
                }

                $scope.testlist = imagearr;
                $scope.grid.myimagecopy = angular.copy($scope.testlist);
                // console.log($scope.grid.myimagecopy);
                refresh(1, 'search');
            };


            // 我的镜像
            ImageStream.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (datalist) {
                //$scope.images = res;
                //console.log('is', datalist.items);
                datalist.items = Sort.sort(datalist.items, -1);
                var connt = 0
                if (datalist.items.length === 0) {
                    $scope.testlist = [];
                }
                var arr = []
                angular.forEach(datalist.items, function (item, i) {
                    if (item.status.tags) {
                        arr.push(item);
                    }
                });
                if (arr.length === 0) {
                    $scope.testlist = [];
                }
                datalist.items = angular.copy(arr);
                angular.forEach(datalist.items, function (item, i) {
                    //$scope.testlist = [];
                    // console.log(item.status.tags);
                    if (item.status.tags && item.status.tags.length > 0) {
                        //console.log(i);
                        connt = connt + 1;
                        angular.forEach(item.status.tags, function (tag, k) {
                            if (tag.tag.split('-')[1]) {
                                datalist.items[i].status.tags.splice(k, 1)
                            }
                        })
                        // console.log(item.metadata.name, item.status.tags[0].tag);
                        // console.log(item.metadata, item.status.tags[0].tag);
                        datalist.items[i].status.tags[0].port = []
                        ImageStreamTag.get({
                            namespace: $rootScope.namespace,
                            name: item.metadata.name + ':' + item.status.tags[0].tag,
                            region: $rootScope.region
                        }, function (data) {
                            angular.forEach(data.image.dockerImageMetadata.ContainerConfig.ExposedPorts, function (port, k) {
                                datalist.items[i].status.tags[0].port.push(k);
                            })
                            $scope.testlist = datalist.items;
                            // console.log('datalist.items',datalist.items);
                            // console.log('datalist.items', $scope.testlist);
                            //datalist.items.sort(function (x, y) {
                            //    return x.sorttime > y.sorttime ? -1 : 1;
                            //});
                            //console.log('$scope.testlist', $scope.testlist);
                            $scope.testcopy = angular.copy(datalist.items);
                            $scope.grid.total = $scope.testcopy.length;
                            // console.log('$scope.testcopy', $scope.testcopy)
                            // console.log('$scope.testcopy',  $scope.grid.total);
                            refresh(1);
                            $scope.uex_back = true;
                            $scope.uex_front = false;
                            // 排列 如果页数发生变化而且点击排序按钮，就refresh()
                            $scope.sortDetail = function () {
                                if ($scope.uex_back){
                                    // alert(1);
                                    datalist.items = Sort.sort(datalist.items, 1); //排序
                                    $scope.uex_back = false;
                                    $scope.uex_front = true;
                                    $scope.testcopy = angular.copy(datalist.items);
                                    refresh($scope.grid.page);
                                } else {
                                    // alert(13);
                                    //默认降序
                                    datalist.items = Sort.sort(datalist.items, -1); //排序
                                    $scope.uex_back = true;
                                    $scope.uex_front = false;
                                    $scope.testcopy = angular.copy(datalist.items);
                                    refresh($scope.grid.page);
                                }
                                if ($scope.text_seach &&$scope.uex_front ){
                                    // alert(1);
                                    $scope.grid.myimagecopy= Sort.sort($scope.grid.myimagecopy, 1); //排序
                                    $scope.uex_back = false;
                                    $scope.uex_front = true;
                                    $scope.grid.myimagecopy  = angular.copy($scope.grid.myimagecopy);
                                    // console.log($scope.grid.myimagecopy );
                                    refresh($scope.grid.page, 'search');
                                }
                                    if( $scope.text_seach && $scope.uex_back){
                                    // alert(13);
                                    //默认降序
                                    $scope.grid.myimagecopy = Sort.sort($scope.grid.myimagecopy, -1); //排序
                                    $scope.uex_back = true;
                                    $scope.uex_front = false;
                                    $scope.grid.myimagecopy  = angular.copy($scope.grid.myimagecopy);
                                    refresh($scope.grid.page, 'search');
                                }
                            }
                        }, function (res) {
                        });
                    }
                    if (datalist.items.length - 1 === i) {
                        if (connt === 0) {
                            $scope.testlist = [];
                        }
                    }
                })
            })


        }]);