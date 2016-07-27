'use strict';
angular.module('console.image', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/card/card.js',
                'components/imagecard/imagecard.js',
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
    .controller('ImageCtrl', ['$filter','$state', '$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort',
        function ($filter,$state, $q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
            // 数组去重
            console.log('$state', $state.params.index);
            if ($state.params.index) {
                $scope.check = $state.params.index
            } else {
                $scope.check = false
            }
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
            $scope.grid = {
                page: 1,
                repertoryspage: 1,
                imagecenterpage: 1,
                size: 8,
                copytest: {},
                search:false
            };
            // 存储commit id 和 分支,angular修改数组内元素属性不能触发刷新
            $scope.gitStore = {};
            // 监视分页的页数控制换页
            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        refresh(newVal,'search');
                    }else {
                        refresh(newVal);
                    }

                }
            });
            $scope.$watch('grid.repertoryspage', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        repertorysrefresh(newVal,'search');
                    }else {
                        repertorysrefresh(newVal);
                    }
                }
            });
            $scope.$watch('grid.imagecenterpage', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        imagecenterrefresh(newVal,'search');
                    }else {
                        imagecenterrefresh(newVal);
                    }
                }
            });
            // myimage控制换页方法
            var refresh = function (page,type) {
                var skip = (page - 1) * $scope.grid.size;
                if (type) {
                    $scope.grid.search=true;
                    $scope.testlist = $scope.grid.myimagecopy.slice(skip, skip + $scope.grid.size);
                    //console.log($scope.grid.myimagecopy);
                    $scope.grid.total = $scope.grid.myimagecopy.length;
                }else {
                    $scope.testlist = $scope.testcopy.slice(skip, skip + $scope.grid.size);
                    //console.log($scope.testcopy);
                    $scope.grid.total = $scope.testcopy.length;
                }

            };
            // regimage控制换页方法
            var repertorysrefresh = function (page,type) {
                var skip = (page - 1) * $scope.grid.size;
                if (type) {
                    $scope.grid.search=true;
                    $scope.repertorys = $scope.grid.regimagecopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.repertorystotal = $scope.grid.regimagecopy.length;
                }else {
                    $scope.repertorys = $scope.repertoryscopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.repertorystotal = $scope.repertoryscopy.length;
                }

                //console.log('1212121212121212122',$scope.repertorys);
            };
            // imagecenter控制换页方法
            var imagecenterrefresh = function (page,type) {
                //console.log(page);
                var skip = (page - 1) * $scope.grid.size;
                if (type=='tag') {
                    $scope.imagecenter = $scope.typeimagecenter.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.typeimagecenter.length;
                }else if(type=='search'){
                    $scope.grid.search=true;
                    $scope.imagecenter = $scope.grid.cenimagecopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.grid.cenimagecopy.length;
                }else {
                    $scope.imagecenter = $scope.imagecentercopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.imagecentercopy.length;
                }



                //console.log('1212121212121212122',$scope.repertorys);
            };


            $scope.fyshow = true;
            // 在searchbar组件中调用
            $scope.doSearch = function (txt) {
                // 使搜索框失去焦点
                $scope.showTip = false;
                $scope.search(txt);
            }
            // 私有镜像平台键盘搜索
            $scope.search = function (key, txt) {
                if (!txt) {
                    $scope.grid.search=false;
                    refresh(1);
                    return;
                }
                var imagearr=[];
                txt = txt.replace(/\//g, '\\/');
                var reg = eval('/' + txt + '/');
                for (var i = 0; i < $scope.testcopy.length; i++) {
                    if (reg.test($scope.testcopy[i].metadata.name)) {
                        imagearr.push($scope.testcopy[i]);
                    }
                }
                $scope.testlist=imagearr;
                $scope.grid.myimagecopy=angular.copy($scope.testlist);
                refresh(1,'search');
            };

            //共有镜像搜索
            $scope.searchreg= function (key,txt,event) {
                if (event) {
                    if (event.keyCode == 13) {
                        if (!txt) {
                            $scope.grid.search=false;
                            repertorysrefresh(1);
                            return;
                        }
                        var imagearr=[];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        for (var i = 0; i < $scope.repertoryscopy.length; i++) {
                            if (reg.test($scope.repertoryscopy[i].name)) {
                                imagearr.push($scope.repertoryscopy[i]);
                            }
                        }
                        $scope.repertorys=imagearr;
                        $scope.grid.regimagecopy=angular.copy($scope.repertorys);
                        repertorysrefresh(1,'search');
                    }
                }else {
                    if (!txt) {
                        $scope.grid.search=false;
                        repertorysrefresh(1);
                        return;
                    }
                    var imagearr=[];
                    txt = txt.replace(/\//g, '\\/');
                    var reg = eval('/' + txt + '/');
                    for (var i = 0; i < $scope.repertoryscopy.length; i++) {
                        if (reg.test($scope.repertoryscopy[i].name)) {
                            imagearr.push($scope.repertoryscopy[i]);
                        }
                    }
                    $scope.repertorys=imagearr;
                    $scope.grid.regimagecopy=angular.copy($scope.repertorys);
                    repertorysrefresh(1,'search');
                }
            }

            //镜像中心搜索
            $scope.imagecenterreg= function (key,txt,event) {
                if (event) {
                    if (event.keyCode == 13) {
                        if (!txt) {
                            $scope.grid.search=false;
                            imagecenterrefresh(1);
                            return;
                        }
                        var imagearr=[];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                            if (reg.test($scope.imagecentercopy[i].name)) {
                                imagearr.push($scope.imagecentercopy[i]);
                            }
                        }
                        console.log(imagearr);
                        $scope.imagecenter=imagearr;
                        $scope.grid.cenimagecopy=angular.copy($scope.imagecenter);
                        imagecenterrefresh(1,'search');
                    }
                }else {
                    if (!txt) {
                        $scope.grid.search=false;
                        imagecenterrefresh(1);
                        return;
                    }
                    var imagearr=[];
                    txt = txt.replace(/\//g, '\\/');
                    var reg = eval('/' + txt + '/');
                    for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                        if (reg.test($scope.imagecentercopy[i].name)) {
                            imagearr.push($scope.imagecentercopy[i]);
                        }
                    }
                    $scope.imagecenter=imagearr;
                    $scope.grid.cenimagecopy=angular.copy($scope.imagecenter);
                    imagecenterrefresh(1,'search');
                }
            }
            // 平台公有镜像键盘搜索(api版)

            //$scope.ksearch = function (key, txt, event) {
            //    if (event.keyCode == 13) {
            //        if (!txt) {
            //            // console.log($scope.grid.copytest)
            //            $scope.newtext = $scope.grid.copytest;
            //            console.log($scope.newtext)
            //            $scope.opened = true;
            //            return;
            //        }
            //        var namelist = [];
            //        txt = txt.replace(/\//g, '\\/');
            //        $http.get('/registry/api/search',
            //            {params: {q: txt}})
            //            .success(function (data) {
            //                console.log(data);
            //                for (var i = 0; i < data.repository.length; i++) {
            //                    // console.log(data.repository[i].project_name);
            //                    namelist.push(data.repository[i].project_name)
            //                }
            //                namelist = namelist.unique();
            //                var item = [];
            //                for (var j = 0; j < namelist.length; j++) {
            //                    item.push({name: namelist[j], items: []});
            //                    for (var k = 0; k < data.repository.length; k++) {
            //                        if (namelist[j] === data.repository[k].project_name) {
            //                            item[j].items.push(data.repository[k].repository_name);
            //                        }
            //                    }
            //                }
            //
            //                for (var q = 0; q < $scope.grid.copytest.length; q++) {
            //                    for (var r = 0; r < item.length; r++) {
            //                        if (item[r].name === $scope.grid.copytest[q].name) {
            //                            item[r].creation_time = $scope.grid.copytest[q].creation_time;
            //                            item[r].mysort = $scope.grid.copytest[q].mysort;
            //                        }
            //                    }
            //                }
            //                item.sort(function (x, y) {
            //                    return x.mysort > y.mysort ? -1 : 1;
            //                });
            //
            //                if (item[0].name) {
            //                    // console.log(item);
            //                    $scope.newtext = item;
            //                    $scope.opened = false;
            //                } else {
            //                    $scope.test = null;
            //                }
            //
            //            })
            //    }
            //}
            //我的镜像
            $http.get('/oapi/v1/namespaces/' + $rootScope.namespace + '/imagestreams')
                .success(function (datalist) {
                    $scope.testlist = datalist.items;
                    $scope.testcopy = angular.copy(datalist.items)
                    $scope.grid.total = $scope.testcopy.length;
                    // console.log('$scope.testcopy', $scope.testcopy)
                    refresh(1)
                    //console.log('$scope.testlist', $scope.testlist)
                })
            // 平台公有镜像搜索
            //$scope.gsearch = function (key, txt) {
            //    if (event.keyCode == 13) {
            //        if (!txt) {
            //            // console.log($scope.grid.copytest)
            //            $scope.newtext = $scope.grid.copytest;
            //            console.log($scope.newtext)
            //            $scope.opened = true;
            //            return;
            //        }
            //        var namelist = [];
            //        txt = txt.replace(/\//g, '\\/');
            //        $http.get('/registry/api/search',
            //            {params: {q: txt}})
            //            .success(function (data) {
            //                console.log(data);
            //                for (var i = 0; i < data.repository.length; i++) {
            //                    // console.log(data.repository[i].project_name);
            //                    namelist.push(data.repository[i].project_name)
            //                }
            //                namelist = namelist.unique();
            //                var item = [];
            //                for (var j = 0; j < namelist.length; j++) {
            //                    item.push({name: namelist[j], items: []});
            //                    for (var k = 0; k < data.repository.length; k++) {
            //                        if (namelist[j] === data.repository[k].project_name) {
            //                            item[j].items.push(data.repository[k].repository_name);
            //                        }
            //                    }
            //                }
            //
            //                for (var q = 0; q < $scope.grid.copytest.length; q++) {
            //                    for (var r = 0; r < item.length; r++) {
            //                        if (item[r].name === $scope.grid.copytest[q].name) {
            //                            item[r].creation_time = $scope.grid.copytest[q].creation_time;
            //                            item[r].mysort = $scope.grid.copytest[q].mysort;
            //                        }
            //                    }
            //                }
            //                item.sort(function (x, y) {
            //                    return x.mysort > y.mysort ? -1 : 1;
            //                });
            //
            //                if (item[0].name) {
            //                    // console.log(item);
            //                    $scope.newtext = item;
            //                    $scope.opened = false;
            //                } else {
            //                    $scope.test = null;
            //                }
            //
            //            })
            //    }
            //}


            // 请求共有镜像平台
            if ($rootScope.namespace.indexOf('org') == -1) {
                $http.get('/registry/api/projects', {
                    params: {is_public: 0}
                }).success(function (data) {
                    $scope.newtext = data;

                    //console.log('regstr',data);

                    //$scope.arr = [];
                    $scope.repertorys = []
                    $scope.tipnum = 0
                    //for (var i = 0; i < data.length; i++) {
                    //  data[i].mysort = data[i].creation_time;
                    //  data[i].mysort = (new Date(data[i].mysort)).getTime()
                    //}
                    ////时间冒泡排序写法
                    //data.sort(function (x, y) {
                    //  return x.mysort > y.mysort ? -1 : 1;
                    //});
                    if (data) {
                        angular.forEach(data, function (repertory, i) {
                            $http.get('/registry/api/repositories', {params: {project_id: repertory.project_id}})
                                .success(function (images) {
                                    $scope.tipnum += images.length
                                    //$scope.arr.push(datalis)
                                    //if ($scope.arr.length == data.length) {
                                    //
                                    //}
                                    angular.forEach(images, function (image, k) {
                                        $http.get('/registry/api/repositories/manifests', {
                                                params: {
                                                    repo_name: image,
                                                    tag: 'latest'
                                                }
                                            })
                                            .success(function (lasttag) {

                                                $scope.repertorys.push({name: image, lasttag: lasttag, canbuid: true});
                                                //console.log($scope.repertorys.length,$scope.tipnum);
                                                if ($scope.repertorys.length == $scope.tipnum) {
                                                    //console.log('镜像仓库',$scope.repertorys);
                                                    $scope.repertoryscopy = angular.copy($scope.repertorys)
                                                    $scope.grid.repertorystotal = $scope.repertorys.length;
                                                    repertorysrefresh(1)
                                                }
                                            }).error(function (err) {
                                            $scope.repertorys.push({name: image, lasttag: null, canbuid: false});
                                            if ($scope.repertorys.length == $scope.tipnum) {
                                                //console.log('镜像仓库',$scope.repertorys);
                                                $scope.repertoryscopy = angular.copy($scope.repertorys)
                                                $scope.grid.repertorystotal = $scope.repertorys.length;

                                                repertorysrefresh(1)
                                            }
                                        })
                                    })
                                })
                        })
                        //for (var j = 0; j < $scope.newtext.length; j++) {
                        //    // 请求共有镜像平台的镜像版本
                        //    $http.get('/registry/api/repositories', {params: {project_id: $scope.newtext[j].project_id}})
                        //        .success(function (datalis) {
                        //            $scope.arr.push(datalis);
                        //
                        //            if ($scope.arr.length == data.length) {
                        //                //console.log('newtext',$scope.arr);
                        //                //angular.forEach($scope.arr, function (item,i) {
                        //                //    console.log('1',item);
                        //                //})
                        //
                        //                for (var k = 0; k < $scope.arr.length; k++) {
                        //
                        //
                        //                    if ($scope.arr[k] != null) {
                        //                        for (var h = 0; h < $scope.newtext.length; h++) {
                        //
                        //                            if ($scope.arr[k][0].split('/')[0] == $scope.newtext[h].name) {
                        //                                $scope.newtext[h].items = $scope.arr[k];
                        //                                //$scope.newtext[h].isshow = true;
                        //                            }
                        //                        }
                        //                    }
                        //                }
                        //
                        //                //console.log('newtext1',$scope.newtext);
                        //            }
                        //
                        //            $scope.grid.copytest = angular.copy($scope.newtext);
                        //
                        //        }).error(function (msg) {
                        //        //TODO:失败时错误处理
                        //    })
                        //}
                    }


                }).error(function (data) {
                    // $log.info('error',data)
                    //$rootScope.user = null;
                    // console.log('error', $rootScope)
                });
            }
            //镜像中心
            $scope.serviceper = [{name:'Datafoundry官方镜像',class:'df'},{name:'Docker官方镜像',class:'doc'}]

            $scope.imagecenterDF = [];
            $scope.imagecenterDoc = [];
            var loaddf = function (fn) {
                $http.get('/registry/api/repositories', {params: {project_id: 58}})
                    .success(function (data) {
                        angular.forEach(data, function (item, i) {
                            $http.get('/registry/api/repositories/manifests', {
                                    params: {
                                        repo_name: item,
                                        tag: 'latest'
                                    }
                                })
                                .success(function (tagmess) {
                                    $scope.imagecenterDF.push({
                                        name: item,
                                        lasttag: tagmess,
                                        canbuild: true,
                                        class: 'df'
                                    });
                                    if ($scope.imagecenterDF.length == data.length) {
                                        if (fn) {
                                            fn()
                                        }
                                        console.log('Datafoundry官方镜像', $scope.imagecenterDF);

                                    }


                                }).error(function (err) {
                                $scope.imagecenterDF.push({name: item, lasttag: null, canbuild: false, class: 'df'});
                                if ($scope.imagecenterDF.length == data.length) {
                                    if (fn) {
                                        fn()
                                    }
                                    console.log('Datafoundry官方镜像', $scope.imagecenterDF);
                                }

                            })
                        })
                    })
            }

            $http.get('/registry/api/repositories', {params: {project_id: 1}})
                .success(function (data) {
                    angular.forEach(data, function (item, i) {
                        //$http.get('/registry/api/repositories/tags', {params: {repo_name: item}})
                        //    .success(function (tags) {
                        $http.get('/registry/api/repositories/manifests', {
                                params: {
                                    repo_name: item,
                                    tag: 'latest'
                                }
                            })
                            .success(function (tagmess) {
                                $scope.imagecenterDoc.push({
                                    name: item,
                                    lasttag: tagmess,
                                    canbuild: true,
                                    class: 'doc'
                                });
                                //$scope.imagecenterDF[i].latest = tagmess;
                                //console.log($scope.imagecenterDoc.length, data.length);
                                //console.log('docker官方镜像', $scope.imagecenterDoc);
                                if ($scope.imagecenterDoc.length == data.length) {
                                    loaddf(function () {
                                        $scope.imagecenter = $scope.imagecenterDoc.concat($scope.imagecenterDF);
                                        $scope.imagecentercopy = angular.copy($scope.imagecenter);
                                        $scope.grid.imagecentertotal = $scope.imagecentercopy.length
                                        imagecenterrefresh(1);
                                        if ($scope.imagecentercopy) {
                                            console.log($scope.imagecentercopy);
                                        }
                                    })

                                    //console.log('docker官方镜像', $scope.imagecenterDoc);
                                }
                            }).error(function (err) {
                            $scope.imagecenterDoc.push({name: item, lasttag: null, canbuild: false, class: 'doc'});
                            //console.log($scope.imagecenterDoc.length,data.length);
                            if ($scope.imagecenterDoc.length == data.length) {
                                loaddf(function () {
                                    $scope.imagecenter = $scope.imagecenterDoc.concat($scope.imagecenterDF);
                                    $scope.imagecentercopy = angular.copy($scope.imagecenter)
                                    $scope.grid.imagecentertotal = $scope.imagecentercopy.length
                                    imagecenterrefresh(1);
                                    if ($scope.imagecentercopy) {
                                        console.log($scope.imagecentercopy);
                                    }
                                })

                                //console.log('docker官方镜像', $scope.imagecenterDoc);
                            }
                        })

                        //})
                    })
                })
            $scope.isComplete='';

            $scope.selectsc = function (tp, key) {

                console.log(key);
                if (key == 'doc') {
                    $scope.isComplete={class:'doc'};
                    $scope.imagecenter=$filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter=angular.copy($scope.imagecenter);
                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //console.log($scope.imagecenter);
                    imagecenterrefresh(1,'tag');
                } else {
                    $scope.isComplete={class:'df'};
                    //console.log($scope.imagecenter);
                    $scope.imagecenter=$filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.typeimagecenter=angular.copy($scope.imagecenter);
                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //$scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //imagecenterrefresh(1);
                    imagecenterrefresh(1,'tag');
                }
                if (key == $scope.grid[tp]) {
                    key = 'all';
                    $scope.isComplete='';
                    $scope.imagecenter=$filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    imagecenterrefresh(1);

                }
                $scope.grid[tp] = key;

            }


        }]);
