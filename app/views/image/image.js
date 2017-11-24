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
    .controller('ImageCtrl', ['primage','pubregistrytag','pubregistry','regpro','platformone','ImageStream', '$filter', '$state', '$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort',
        function (primage,pubregistrytag,pubregistry,regpro,platformone,ImageStream, $filter, $state, $q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
            // 数组去重
            //console.log('$state', $state.params.index);
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
                ckPage:1,
                size: 12,
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
            $scope.primage = [];
            //console.log('primage', primage);
            var onlymyimage = []
            angular.forEach(primage.repositories, function (image,i) {
                //if (image.split('/')[0] === $rootScope.namespace) {
                    onlymyimage.push(image)
                //}
            })
            //console.log('image', onlymyimage);

            //pubregistry.get(function (data) {
                angular.forEach(onlymyimage, function (image,i) {
                    var namespace=image.split('/')[0];
                    var name=image.split('/')[1];
                    $scope.primage.push({name:image,tags:[],image:image})
                    pubregistrytag.get({namespace:namespace,name:name}, function (tag) {
                        //console.log('tag', tag);
                        $scope.primage[i].tags= tag.tags;
                        //console.log('$scope.primage', $scope.primage);
                    })
                })
            $scope.grid.ckTotal = $scope.primage.length;
            ckRefresh(1);

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
            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        refresh(newVal, 'search');
                    } else {
                        refresh(newVal);
                    }

                }
            });
            $scope.$watch('grid.repertoryspage', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        repertorysrefresh(newVal, 'search');
                    } else {
                        repertorysrefresh(newVal);
                    }
                }
            });

            $scope.$watch('grid.imagecenterpage', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    if ($scope.grid.search) {
                        imagecenterrefresh(newVal, 'search');
                    } else {
                        imagecenterrefresh(newVal);
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
                    //console.log($scope.grid.myimagecopy);
                    $scope.grid.total = $scope.grid.myimagecopy.length;
                } else {
                    $scope.testlist = $scope.testcopy.slice(skip, skip + $scope.grid.size);
                    //console.log($scope.testcopy);
                    $scope.grid.total = $scope.testcopy.length;
                }

            };

            // regimage控制换页方法
            var repertorysrefresh = function (page, type) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                if (type) {
                    $scope.grid.search = true;
                    $scope.repertoryspoj = $scope.grid.regimagecopy.slice(skip, skip + $scope.grid.size);

                    $scope.grid.repertorystotal = $scope.grid.regimagecopy.length;
                    $scope.repertorys = [];
                    angular.forEach($scope.repertoryspoj, function (image) {
                        //    angular.forEach(images, function (image, k) {
                        //
                        platformone.get({id: image.name, tag: 'latest'}, function (lasttag) {
                            //console.log('docdata', docdata);
                            $scope.repertorys.push({name: image, lasttag: lasttag, canbuid: true});
                        }, function (err) {
                            $scope.repertorys.push({name: image, lasttag: null, canbuid: false});
                        })

                    })
                } else {
                    $scope.repertoryspoj = $scope.repertoryscopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.repertorystotal = $scope.repertoryscopy.length;
                    //console.log($scope.repertoryspoj);
                    $scope.repertorys = [];
                    angular.forEach($scope.repertoryspoj, function (image) {
                        //    angular.forEach(images, function (image, k) {
                        //
                        platformone.get({id: image.name, tag: 'latest'}, function (lasttag) {
                            //console.log('docdata', docdata);
                            $scope.repertorys.push({name: image, lasttag: lasttag, canbuid: true});
                        }, function (err) {
                            $scope.repertorys.push({name: image, lasttag: null, canbuid: false});
                        })

                    })

                }

                //console.log('1212121212121212122',$scope.repertorys);
            };
            // imagecenter控制换页方法
            var imagecenterrefresh = function (page, type) {
                //console.log(page);
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                if (type == 'search') {
                    //console.log($scope.typeimagecenter);
                    $scope.grid.search = true;
                    $scope.imagecenter = $scope.grid.cenimagecopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.grid.cenimagecopy.length;
                    angular.forEach($scope.imagecenter, function (image, k) {
                        platformone.get({id: image.name, tag: 'latest'}, function (docdata) {
                            //console.log('docdata', docdata);
                            image.lasttag = docdata;
                        }, function (err) {
                            image.canbuid = false;
                        })


                    })

                } else if (type == 'tag' || $scope.cententtype == 'type') {
                    //console.log('typeimagecenter',$scope.typeimagecenter);
                    $scope.imagecenter = $scope.typeimagecenter.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.typeimagecenter.length;
                    angular.forEach($scope.imagecenter, function (image, k) {
                        platformone.get({id: image.name, tag: 'latest'}, function (docdata) {
                            //console.log('docdata', docdata);
                            image.lasttag = docdata;
                        }, function (err) {
                            image.canbuid = false;
                        })


                    })
                } else {
                    $scope.imagecenter = $scope.imagecentercopy.slice(skip, skip + $scope.grid.size);
                    $scope.grid.imagecentertotal = $scope.imagecentercopy.length;
                    angular.forEach($scope.imagecenter, function (image, k) {
                        platformone.get({id: image.name, tag: 'latest'}, function (docdata) {
                            //console.log('docdata', docdata);
                            image.lasttag = docdata;
                        }, function (err) {
                            image.canbuid = false;
                        })


                    })

                }


                //console.log('1212121212121212122',$scope.repertorys);
            };
            // 在searchbar组件中调用
            $scope.doSearch = function (txt) {
                // 使搜索框失去焦点
                $scope.showTip = false;
                $scope.search(txt);
            }
            // 私有镜像平台键盘搜索
            $scope.text1='您还没有构建镜像，构建完成后，可以在这里查看构建镜像！';
            $scope.search = function (key, txt) {
                if (!txt) {
                    $scope.grid.search = false;
                    refresh(1);
                    return;
                }
                var imagearr = [];
                txt = txt.replace(/\//g, '\\/');
                var reg = eval('/' + txt + '/');
                if($scope.testcopy){
                    for (var i = 0; i < $scope.testcopy.length; i++) {
                        if (reg.test($scope.testcopy[i].metadata.name)) {
                            imagearr.push($scope.testcopy[i]);
                        }
                    }
                }
                if(imagearr.length===0){
                    $scope.text1='没有查询到相关数据';
                }else{
                    $scope.text1='您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
                }

                $scope.testlist = imagearr;
                $scope.grid.myimagecopy = angular.copy($scope.testlist);
                refresh(1, 'search');
            };
            //仓库镜像搜索
            $scope.cksearch = function (key, txt) {
                if (!txt) {
                    $scope.grid.search = false;
                    ckRefresh(1);
                    return;
                }
                var imagearr = [];
                txt = txt.replace(/\//g, '\\/');
                var reg = eval('/' + txt + '/');
                if($scope.primage){
                    for (var i = 0; i < $scope.primage.length; i++) {
                        if (reg.test($scope.primage[i].name)) {
                            imagearr.push($scope.primage[i]);
                        }
                    }
                }
                $scope.thisprimage = imagearr;
                ckRefresh(1,'search');

            };

            $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
                //console.log('ok');
            })
            //共有镜像搜索
            $scope.text2='您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
            $scope.searchreg = function (key, txt, event) {
                if (event) {
                    if (true) {
                        if (!txt) {
                            $scope.grid.search = false;
                            repertorysrefresh(1);
                            return;
                        }
                        var imagearr = [];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        for (var i = 0; i < $scope.repertoryscopy.length; i++) {
                            if (reg.test($scope.repertoryscopy[i])) {
                                imagearr.push($scope.repertoryscopy[i]);
                            }
                        }
                        if(imagearr.length===0){
                            $scope.text2='没有查询到相关数据';
                        }else{
                            $scope.text2='您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
                        }
                        $scope.repertoryspoj = imagearr;
                        $scope.grid.regimagecopy = angular.copy($scope.repertoryspoj);
                        repertorysrefresh(1, 'search');
                    }
                } else {
                    if (!txt) {
                        $scope.grid.search = false;
                        repertorysrefresh(1);
                        return;
                    }
                    var imagearr = [];
                    txt = txt.replace(/\//g, '\\/');
                    var reg = eval('/' + txt + '/');
                    for (var i = 0; i < $scope.repertoryscopy.length; i++) {
                        if (reg.test($scope.repertoryscopy[i])) {
                            imagearr.push($scope.repertoryscopy[i]);
                        }
                    }
                    $scope.repertoryspoj = imagearr;
                    $scope.grid.regimagecopy = angular.copy($scope.repertoryspoj);
                    repertorysrefresh(1, 'search');
                }
            }

            //镜像中心搜索
            $scope.text3='您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
            $scope.imagecenterreg = function (key, txt, event) {
                $scope.cententsearch = 'search';
                if (event) {
                    if (true) {
                        if (!txt) {
                            $scope.cententsearch = false;
                            $scope.grid.search = false;
                            imagecenterrefresh(1);
                            return;
                        }
                        var imagearr = [];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        //console.log($scope.typeimagecenter,$scope.cententtype);
                        if ($scope.cententtype == 'type') {
                            for (var i = 0; i < $scope.typeimagecenter.length; i++) {
                                //console.log($scope.typeimagecenter[i].name);
                                if (reg.test($scope.typeimagecenter[i].name)) {
                                    //console.log($scope.typeimagecenter[i].name);
                                    imagearr.push($scope.typeimagecenter[i]);
                                }
                            }

                        } else {
                            for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                                //console.log($scope.imagecentercopy[i].name);
                                if (reg.test($scope.imagecentercopy[i].name)) {
                                    imagearr.push($scope.imagecentercopy[i]);
                                }
                            }
                        }
                        if(imagearr.length===0){
                            $scope.text3='没有查询到相关数据';
                        }else{
                            $scope.text3='您还没有构建镜像，构建完成后，可以在这里查看构建镜像';
                        }
                        //console.log(imagearr);
                        $scope.imagecenter = imagearr;
                        $scope.grid.cenimagecopy = angular.copy($scope.imagecenter);
                        imagecenterrefresh(1, 'search');
                    }
                } else {
                    if (!txt) {
                        $scope.cententsearch = false;
                        $scope.grid.search = false;
                        imagecenterrefresh(1);
                        return;
                    }
                    var imagearr = [];
                    txt = txt.replace(/\//g, '\\/');
                    var reg = eval('/' + txt + '/');
                    if ($scope.cententtype == 'type') {
                        for (var i = 0; i < $scope.typeimagecenter.length; i++) {
                            if (reg.test($scope.typeimagecenter[i].name)) {
                                imagearr.push($scope.typeimagecenter[i]);
                            }
                        }
                    } else {
                        for (var i = 0; i < $scope.imagecentercopy.length; i++) {
                            if (reg.test($scope.imagecentercopy[i].name)) {
                                imagearr.push($scope.imagecentercopy[i]);
                            }
                        }
                    }
                    $scope.imagecenter = imagearr;
                    $scope.grid.cenimagecopy = angular.copy($scope.imagecenter);
                    imagecenterrefresh(1, 'search');
                }
            }

            // 我的镜像
            ImageStream.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (datalist) {
                //$scope.images = res;
                //console.log('is',datalist.items);
                var connt = 0
                if (datalist.items.length === 0) {
                    $scope.testlist = [];
                }
                var arr=[]
                angular.forEach(datalist.items, function (item, i) {
                    if (item.status.tags) {
                        arr.push(item);
                    }
                })
                if (arr.length === 0) {
                    $scope.testlist = [];
                }
                datalist.items=angular.copy(arr);
                angular.forEach(datalist.items, function (item, i) {

                    //$scope.testlist = [];

                    if (item.status.tags && item.status.tags.length > 0) {
                        //console.log(i);
                        connt = connt + 1;
                        angular.forEach(item.status.tags, function (tag, k) {
                            if (tag.tag.split('-')[1]) {
                                datalist.items[i].status.tags.splice(k, 1)
                            }
                        })

                        //console.log(item.metadata.name, item.status.tags[0].tag);
                        datalist.items[i].status.tags[0].port = []
                        ImageStreamTag.get({
                            namespace: $rootScope.namespace,
                            name: item.metadata.name + ':' + item.status.tags[0].tag,
                            region: $rootScope.region
                        }, function (data) {
                            //console.log(data);
                            angular.forEach(data.image.dockerImageMetadata.ContainerConfig.ExposedPorts, function (port, k) {
                                datalist.items[i].status.tags[0].port.push(k);
                            })

                            $scope.testlist = datalist.items;
                            //console.log('datalist.items',datalist.items);
                            //datalist.items.sort(function (x, y) {
                            //    return x.sorttime > y.sorttime ? -1 : 1;
                            //});
                            //console.log('$scope.testlist', $scope.testlist);

                            $scope.testcopy = angular.copy(datalist.items);

                            $scope.grid.total = $scope.testcopy.length;
                            // console.log('$scope.testcopy', $scope.testcopy)
                            refresh(1)


                        }, function (res) {

                        });
                    }


                    if (datalist.items.length - 1 === i) {
                        if (connt === 0) {
                            $scope.testlist=[];
                        }
                    }
                    //console.log('$scope.testlist',$scope.testlist);
                    //datalist.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                })

                //console.log('$scope.testlist', $scope.testlist);
            })
            //$http.get('/oapi/v1/namespaces/' + $rootScope.namespace + '/imagestreams')
            //    .success(function (datalist) {
            //
            //        //$scope.testlist = datalist.items;
            //
            //        angular.forEach(datalist.items, function (item, i) {
            //
            //            if (item.status.tags && item.status.tags.length > 0) {
            //                angular.forEach(item.status.tags, function (tag, k) {
            //                    if (tag.tag.split('-')[1]) {
            //                        datalist.items[i].status.tags.splice(k, 1)
            //                    }
            //                })
            //
            //                //console.log(item.metadata.name, item.status.tags[0].tag);
            //                datalist.items[i].status.tags[0].port = []
            //                ImageStreamTag.get({
            //                    namespace: $rootScope.namespace,
            //                    name: item.metadata.name + ':' + item.status.tags[0].tag
            //                }, function (data) {
            //                    //console.log(data);
            //                    angular.forEach(data.image.dockerImageMetadata.ContainerConfig.ExposedPorts, function (port, k) {
            //
            //                        datalist.items[i].status.tags[0].port.push(k);
            //                    })
            //                    //console.log(datalist.items[i].status.tags[0]);
            //                    $scope.testlist = datalist.items;
            //                    console.log('datalist.items',datalist.items);
            //                    //datalist.items.sort(function (x, y) {
            //                    //    return x.sorttime > y.sorttime ? -1 : 1;
            //                    //});
            //                    //console.log('$scope.testlist', $scope.testlist);
            //                    $scope.testcopy = angular.copy(datalist.items);
            //
            //                    $scope.grid.total = $scope.testcopy.length;
            //                    // console.log('$scope.testcopy', $scope.testcopy)
            //                    refresh(1)
            //                }, function (res) {
            //
            //                });
            //            }
            //
            //            //datalist.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
            //        })
            //
            //        console.log('$scope.testlist', $scope.testlist)
            //    })


            // 请求仓库镜像

            //if ($rootScope.namespace.indexOf('org') == -1) {
            //    regpro.query({is_public: 0}, function (data) {
            //        $scope.newtext = data;
            //        $scope.arr = [];
            //        $scope.repertorys = []
            //        $scope.repertoryspoj = []
            //        $scope.tipnum = 0
            //        if (data) {
            //            angular.forEach(data, function (repertory, i) {
            //                platform.query({id:repertory.project_id}, function (images) {
            //                    $scope.arr.push(images);
            //                    if ($scope.arr.length == data.length) {
            //                        //console.log('regstr',$scope.arr);
            //                        angular.forEach($scope.arr, function (items, k) {
            //                            angular.forEach(items, function (item, j) {
            //                                $scope.repertoryspoj.push(item);
            //                            })
            //                        })
            //                        //console.log('regstr', $scope.repertoryspoj);
            //                        $scope.repertoryscopy = angular.copy($scope.repertoryspoj)
            //                        $scope.grid.repertorystotal = $scope.repertoryspoj.length;
            //                        repertorysrefresh(1)
            //
            //                    }
            //                })
            //                //$http.get('/registry/api/repositories', {
            //                //        timeout: end.promise,
            //                //        params: {project_id: repertory.project_id}
            //                //    })
            //                //    .success(function (images) {
            //                //        //$scope.tipnum += images.length
            //                //        $scope.arr.push(images);
            //                //        if ($scope.arr.length == data.length) {
            //                //            //console.log('regstr',$scope.arr);
            //                //            angular.forEach($scope.arr, function (items, k) {
            //                //                angular.forEach(items, function (item, j) {
            //                //                    $scope.repertoryspoj.push(item);
            //                //                })
            //                //            })
            //                //            //console.log('regstr', $scope.repertoryspoj);
            //                //            $scope.repertoryscopy = angular.copy($scope.repertoryspoj)
            //                //            $scope.grid.repertorystotal = $scope.repertoryspoj.length;
            //                //            repertorysrefresh(1)
            //                //
            //                //        }
            //                //
            //                //    })
            //            })
            //
            //
            //        }
            //    })
            //    regpro.query({is_public: 0}, function (data) {
            //        $scope.newtext = data;
            //        $scope.arr = [];
            //        $scope.repertorys = []
            //        $scope.repertoryspoj = []
            //        $scope.tipnum = 0
            //        if (data) {
            //            angular.forEach(data, function (repertory, i) {
            //                platform.query({id:repertory.project_id}, function (images) {
            //                    $scope.arr.push(images);
            //                    if ($scope.arr.length == data.length) {
            //                        //console.log('regstr',$scope.arr);
            //                        angular.forEach($scope.arr, function (items, k) {
            //                            angular.forEach(items, function (item, j) {
            //                                $scope.repertoryspoj.push(item);
            //                            })
            //                        })
            //                        //console.log('regstr', $scope.repertoryspoj);
            //                        $scope.repertoryscopy = angular.copy($scope.repertoryspoj)
            //                        $scope.grid.repertorystotal = $scope.repertoryspoj.length;
            //                        repertorysrefresh(1)
            //
            //                    }
            //                })
            //
            //            })
            //
            //
            //        }
            //    })
            //
            //}

            //镜像中心
            $scope.serviceper = [{name: 'DataFoundry', class: 'df'}, {name: 'DockerHub', class: 'doc'}]

            //platform.query({id:1}, function (docdata) {
            //    angular.forEach(docdata, function (docitem, i) {
            //        $scope.imagecenterDoc.push({
            //            name: docitem,
            //            lasttag: null,
            //            canbuild: true,
            //            class: 'doc'
            //        });
            //    })
            //    platform.query({id:5}, function (dfdata) {
            //        angular.forEach(dfdata, function (dfitem, k) {
            //            $scope.imagecenterDF.push({
            //                name: dfitem,
            //                lasttag: null,
            //                canbuild: true,
            //                class: 'df'
            //            });
            //        });
            //        $scope.imagecenterpoj = $scope.imagecenterDoc.concat($scope.imagecenterDF);
            //        //console.log('imagecenterpoj', $scope.imagecenterpoj);
            //        $scope.imagecentercopy = angular.copy($scope.imagecenterpoj);
            //        $scope.grid.imagecentertotal = $scope.imagecentercopy.length
            //        imagecenterrefresh(1);
            //    })
            //})
            //$http.get('/registry/api/repositories', {timeout: end.promise, params: {project_id: 1}})
            //    .success(function (docdata) {
            //        angular.forEach(docdata, function (docitem, i) {
            //            $scope.imagecenterDoc.push({
            //                name: docitem,
            //                lasttag: null,
            //                canbuild: true,
            //                class: 'doc'
            //            });
            //        })
            //        $http.get('/registry/api/repositories', {
            //                timeout: end.promise,
            //                params: {project_id: 58}
            //            })
            //            .success(function (dfdata) {
            //                angular.forEach(dfdata, function (dfitem, k) {
            //                    $scope.imagecenterDF.push({
            //                        name: dfitem,
            //                        lasttag: null,
            //                        canbuild: true,
            //                        class: 'df'
            //                    });
            //                });
            //                $scope.imagecenterpoj = $scope.imagecenterDoc.concat($scope.imagecenterDF);
            //                //console.log('imagecenterpoj', $scope.imagecenterpoj);
            //                $scope.imagecentercopy = angular.copy($scope.imagecenterpoj);
            //                $scope.grid.imagecentertotal = $scope.imagecentercopy.length
            //                imagecenterrefresh(1);
            //
            //            })
            //    }).error(function (err) {
            //
            //})

            $scope.isComplete = '';

            $scope.selectsc = function (tp, key) {
                if (!$scope.imagecentercopy) {
                    return;
                }
                //console.log(key);
                $scope.cententtype = 'type';

                if (key == 'doc') {
                    $scope.isComplete = {class: 'doc'};

                    if ($scope.cententsearch == 'search') {
                        $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    } else {
                        $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    }

                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //console.log($scope.imagecenter);
                    $scope.grid.imagecenterpage = 1
                    imagecenterrefresh(1, 'tag');
                } else {
                    $scope.isComplete = {class: 'df'};
                    //console.log($scope.imagecenter);
                    if ($scope.cententsearch == 'search') {
                        $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    } else {
                        $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    }
                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //$scope.grid.imagecentertotal = $scope.imagecenter.length;
                    //imagecenterrefresh(1);
                    $scope.grid.imagecenterpage = 1
                    imagecenterrefresh(1, 'tag');
                }
                if (key == $scope.grid[tp]) {
                    $scope.cententtype = false
                    key = 'all';

                    $scope.isComplete = '';
                    //$scope.imagecenter=$scope.imagecenterpoj;
                    if ($scope.cententsearch == 'search') {
                        //alert(11)
                        $scope.imagecenter = $filter("imagefilter")($scope.grid.cenimagecopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    } else {

                        $scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                        //console.log($scope.imagecenter);
                        $scope.typeimagecenter = angular.copy($scope.imagecenter);
                    }
                    //$scope.imagecenter = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                    //console.log($scope.imagecenter);
                    $scope.grid.imagecentertotal = $scope.imagecenter.length;
                    $scope.grid.imagecenterpage = 1;
                    imagecenterrefresh(1, 'tag');

                }

                $scope.grid[tp] = key;
                //console.log($scope.grid[tp]);
            }


        }]);