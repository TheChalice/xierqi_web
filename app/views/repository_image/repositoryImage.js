'use strict';
angular.module('console.repository-image', [
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
    .controller('RepositoryImageCtrl', ['registryptag', 'registryp', 'pubregistrytag', 'pubregistry', 'regpro', 'platformone', 'ImageStream', '$filter', '$state', '$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort',
        function (registryptag, registryp, pubregistrytag, pubregistry, regpro, platformone, ImageStream, $filter, $state, $q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
            // 数组去重
            $scope.primage = [];
            $scope.proname = ''
            $scope.changename = function (reg) {
                $scope.project_id = reg.project_id;
                $scope.proname = reg.name;
                $scope.primage = [];
                $scope.cktxt="";
                platform.query({ id: reg.project_id }, function (images) {
                    angular.forEach(images, function (image, i) {
                        // console.log('image', image);
                        $scope.primage.push({
                            name: image.name,
                            tags: [],
                            image: image.name,
                            metadata: {
                                creationTimestamp: image.creation_time
                            },
                            creation_time: image.creation_time,
                            update_time: image.update_time

                        })
                    })
                    $scope.primage = Sort.sort($scope.primage, -1)
                    $scope.grid.ckTotal = $scope.primage.length;
                    ckRefresh(1);
                })
            }
            registryp.query(function (date) {
                // console.log('regdate', date);
                angular.forEach(date, function (time, i) {
                    date.metadata = { creationTimestamp: time.creation_time }
                })

                $scope.regdate = Sort.sort(date, -1);
            }, function (err) {

            })

            if ($state.params.index) {
                $scope.check = $state.params.index
            } else {
                $scope.check = false
            }
            $scope.imagecenterDF = [];
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
            // 仓库镜像控制翻页
            var ckRefresh = function (page, type) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                if (type) {
                    $scope.grid.search = true;
                    $scope.newprimage = $scope.thisprimage.slice(skip, skip + $scope.grid.size);
                    $scope.grid.ckTotal = $scope.thisprimage.length;
                } else {
                    $scope.newprimage = $scope.primage.slice(skip, skip + $scope.grid.size);
                    $scope.grid.ckTotal = $scope.primage.length;
                }
            };
            //})
            $scope.$on('$destroy', function () {
                end.resolve();
            });
            // 存储commit id 和 分支,angular修改数组内元素属性不能触发刷新
            $scope.gitStore = {};
            // 监视分页的页数控制换页
            $scope.$watch('grid.ckPage', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        ckRefresh(newVal, 'search');
                    } else {
                        ckRefresh(newVal);
                    }
                }
            });

            // 在searchbar组件中调用
            $scope.doSearch = function (txt) {
                // 使搜索框失去焦点
                $scope.showTip = false;
                $scope.search(txt);
            }

            //仓库镜像搜索
            $scope.cksearch = function (key, txt) {
                if (!txt) {
                    $scope.grid.search = false;
                    ckRefresh(1);
                    return;
                }
                var imagearr = [];
                txt = txt.replace(/\//g, '\\/');
                var reg = new RegExp(txt);
                // var reg = eval('/' + txt + '/');
                if ($scope.primage) {
                    for (var i = 0; i < $scope.primage.length; i++) {
                        if (reg.test($scope.primage[i].name)) {
                            imagearr.push($scope.primage[i]);
                        }
                    }
                }
                $scope.thisprimage = imagearr;
                ckRefresh(1, 'search');

            };

            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                //console.log('ok');
            })









        }]);