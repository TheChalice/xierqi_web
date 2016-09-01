/**
 * Created by jxy on 16/8/30.
 */
angular.module('home.application', [
    {
        files: [
            'views/home/application/application.css'
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
    .controller('applicationCtrl', ['$scope', '$log','$state','$rootScope','saas','$http','$filter', function ($scope, $log,$state,$rootScope,saas,$http,$filter) {
           $scope.grid = {
               active : 1,
               hotimglist :1,
               total : '',
               page : 1,
               size : 8,

           }
        ////////////SAAS,镜像切换
        $scope.changeTb = function(num){
            if(num == 1){
                $scope.grid.active = 1
            }else if(num == 2){
                $scope.grid.active = 2
            }
        }
        ////// 热门镜像排行切换
        $scope.changehotTab = function(idx){
            if(idx == 1){
                $scope.grid.hotimglist = 1
            }else if(idx == 2){
                $scope.grid.hotimglist = 2
            }
        }
        //$scope.howSaas = function(){
        //    simpleAlert.open('申请使用说明','您申请服务之后，通过创建用户自定义后端服务实例来集成自己的服务以及SaaS服务.');
        //}
        //$scope.howpushimg = function(){
        //    simpleAlert.open('拉取镜像说明','<p>11<p/><p>22<p/>');
        //}
        $scope.checkcollect = function(){
            if(!$rootScope.user){
                $state.go('login');
            }else{
                alert(1);
            }
        }

        /////创建saas服务
        $scope.createsaas = function(){
            if(!$rootScope.user){
                $state.go('login',{type : 'saas',name : 'saas'});
            }else{
                $state.go('console.create_saas',{name:'saas'});
            }
        }
        /////部署镜像
        $scope.deployimg = function(){
            if(!$rootScope.user){
                $state.go('login',{type : 'image',name : 'aaa'+':latest'+':registryjump'});
            }else{
                $state.go('console.service_create',{image:'aaa'+':latest'+':registryjump'});
            }
        }
        var test = function(){
            saas.get({},function(data){
                console.log('------------------',data);
            })
        }
        test();

        /////////////////////////////////////////////////////////镜像中心
        $scope.serviceper = [{name: 'Datafoundry官方镜像', class: 'df'}, {name: 'Docker官方镜像', class: 'doc'}]

        $scope.imagecenterDF = [];
        $scope.imagecenterDoc = [];
        //var loaddf = function (fn) {
        //    $http.get('/registry/api/repositories', {
        //        timeout:end.promise,
        //        params: {project_id: 58}})
        //        .success(function (data) {
        //            angular.forEach(data, function (item, i) {
        //                $http.get('/registry/api/repositories/manifests', {
        //                        timeout:end.promise,
        //                        params: {
        //                            repo_name: item,
        //                            tag: 'latest'
        //                        }
        //                    })
        //                    .success(function (tagmess) {
        //                        $scope.imagecenterDF.push({
        //                            name: item,
        //                            lasttag: tagmess,
        //                            canbuild: true,
        //                            class: 'df'
        //                        });
        //                        if ($scope.imagecenterDF.length == data.length) {
        //                            if (fn) {
        //                                fn()
        //                            }
        //                            //console.log('Datafoundry官方镜像', $scope.imagecenterDF);
        //
        //                        }
        //
        //
        //                    }).error(function (err) {
        //                    $scope.imagecenterDF.push({
        //                        name: item,
        //                        lasttag: null,
        //                        canbuild: false,
        //                        class: 'df'});
        //                    if ($scope.imagecenterDF.length == data.length) {
        //                        if (fn) {
        //                            fn()
        //                        }
        //                        //console.log('Datafoundry官方镜像', $scope.imagecenterDF);
        //                    }
        //
        //                })
        //            })
        //        })
        //}
        $http.get('/registry/api/repositories', {params: {project_id: 1}})
            .success(function (docdata) {
                angular.forEach(docdata, function (docitem, i) {
                    $scope.imagecenterDoc.push({
                        name: docitem,
                        lasttag: null,
                        canbuild: false,
                        class: 'doc'
                    });
                })
                $http.get('/registry/api/repositories', {
                        //timeout: end.promise,
                        params: {project_id: 58}
                    })
                    .success(function (dfdata) {
                        angular.forEach(dfdata, function (dfitem, k) {
                            $scope.imagecenterDF.push({
                                name: dfitem,
                                lasttag: null,
                                canbuild: false,
                                class: 'df',
                            });
                        });
                        $scope.imagecenterpoj = $scope.imagecenterDoc.concat($scope.imagecenterDF);
                        //console.log('++++++++++++++', $scope.imagecenterpoj);
                        angular.forEach($scope.imagecenterpoj, function (item, i) {
                            $http.get('/registry/api/repositories/manifests', {
                                    params: {
                                        repo_name: $scope.imagecenterpoj[i].name,
                                        tag: 'latest'
                                    }
                                })
                                .success(function (lasttag) {
                                    $scope.imagecenterpoj[i].lasttag = lasttag;
                                    $scope.imagecenterpoj[i].canbuid = true;
                                    if($scope.imagecenterpoj.length == i+1){
                                        $scope.imagecentercopy = angular.copy($scope.imagecenterpoj);
                                        $scope.grid.total = $scope.imagecentercopy.length;
                                        refresh(1);
                                    }

                                }).error(function (err) {
                                $scope.imagecenterpoj[i].lasttag = null;
                                $scope.imagecenterpoj[i].canbuid = false;
                                if($scope.imagecenterpoj.length == i+1){
                                    $scope.imagecentercopy = angular.copy($scope.imagecenterpoj);
                                    $scope.grid.total = $scope.imagecentercopy.length;
                                    refresh(1);
                                }

                            })

                        });
                        //console.log('imagecenterpoj', $scope.imagecenterpoj);

                    })
            }).error(function (err) {

        })
        // 控制换页方法
        var refresh = function (page,tag) {
            if (tag) {
                var skip = (page - 1) * $scope.grid.size;
                $scope.imagecenterpoj = $scope.apple.slice(skip, skip + $scope.grid.size);
                $scope.grid.total = $scope.apple.length;
            }else{
                var skip = (page - 1) * $scope.grid.size;
                $scope.imagecenterpoj = $scope.imagecentercopy.slice(skip, skip + $scope.grid.size);
                $scope.grid.total = $scope.imagecentercopy.length;
            }



        };
        // 监视分页的页数控制换页
        $scope.$watch('grid.page', function (newVal, oldVal) {
            if (newVal != oldVal) {
                //if ($scope.grid.search) {
                //    refresh(newVal, 'search');
                //} else {
                if($scope.flog){
                    refresh(newVal,'tag');
                }else{
                    refresh(newVal);
                }

                //}

            }
        });

        $scope.test = '提供者'
        $scope.selectsc = function (key,name) {
            $scope.flog='tag'
            $scope.test = name
            if (key == 'doc') {
                $scope.isComplete = {class: 'doc'};
                $scope.imagecenterpoj = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                $scope.apple = angular.copy($scope.imagecenterpoj);
                $scope.grid.total = $scope.imagecenterpoj.length;
                $scope.grid.page = 1
                refresh(1,'tag');
            } else {
                $scope.isComplete = {class: 'df'};
                $scope.imagecenterpoj = $filter("imagefilter")($scope.imagecentercopy, $scope.isComplete);
                $scope.apple = angular.copy($scope.imagecenterpoj);
                $scope.grid.total = $scope.imagecenterpoj.length;
                $scope.grid.page = 1
               refresh(1,'tag');
            }
        }
        //////////////////////////saas
        var loadsaas = function(){
            saas.get({},function(res){
                    console.log('-+_+_+_+_',res);
            })
        }
        loadsaas();
    }]);
