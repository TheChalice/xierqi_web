'use strict';
angular.module('home.login', [])
    .controller('loginCtrl', ['User','Cookie','sessiontoken','$base64','Project','$q','regions', 'ModalRegist', '$interval', '$state', '$rootScope', 'AuthService', '$scope', '$log', '$stateParams','GLOBAL',
        function (User,Cookie,sessiontoken,$base64,Project,$q,regions, ModalRegist, $interval, $state, $rootScope, AuthService, $scope, $log, $stateParams,GLOBAL) {
            //console.log("+_+_+_+_+_+_+_+", $stateParams);
            $rootScope.credentials={};
            //regions.query({}, function (data) {
            //    //console.log('regions', data);
            //    $scope.regionlist = data;
            //    $scope.copyregionlist=angular.copy(data);
            //    $rootScope.credentials.region=data[0].identification;
            //    $scope.curregion=data[0].region_describe
            //})
            $('.loginname').focus();
            //$rootScope.credentials = {
            //    region:'cn-north-1'
            //};
            //$scope.curregion = '铸造一区'
            $scope.loginerror = {}
            var flog = localStorage.getItem("code");
            var vm = $scope.vm = {
                code: ''
            }
            if (flog > 3) {
                $rootScope.loginyanzheng = true;
            } else if (flog <= 3 || !flog) {
                $rootScope.loginyanzheng = false;
            }
            //$scope.curregion = '一区一区';
            $scope.checkregion = function (res,regionid) {
                $scope.curregion=res;
                $rootScope.credentials.region = regionid;
            }
            $scope.$watch('curregion', function (n,o) {
                if (n === o) {
                    return
                }
                //$scope.regionlist=$scope.copyregionlist;
                var arr = angular.copy($scope.copyregionlist)
                if ($scope.regionlist) {
                    //console.log($scope.regionlist,$scope.copyregionlist);
                    angular.forEach( $scope.copyregionlist, function (item,i) {
                       if (item.region_describe === n) {
                           //console.log(item.region_describe, $scope.regionlist);
                           arr.splice(i, 1);
                           $scope.regionlist=arr;
                       }
                   })
                }
            })
            //$scope.regionlist = [
            //    {regionname : '一区一区'},
            //    {regionname : '二区二区'}
            //]
            // 进度条暂时不启用
            // var vm = $scope.vm = {};
            // vm.value = 0;
            // vm.style = 'progress-bar-danger';
            // vm.showLabel = true;
            // vm.striped = true;
            //
            // $scope.selectValue = function (){
            //   console.log(vm.style);
            // };
            // var index = 0;
            // var timeId = 100;
            // $scope.count = function(){
            //   var start = $interval(function(){
            //     vm.value =  ++index;
            //     if (index > 99) {
            //       $interval.cancel(start);
            //     }
            //     if (index == 60) {
            //       index = 99;
            //     }
            //   }, timeId);
            // };
            function codenum() {
                var str = [
                    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                    'o', 'p', 'q', 'r', 's', 't', 'x', 'u', 'v', 'y', 'z', 'w', 'n',
                    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
                ];
                var num = null;
                for (var i = 0; i < 4; i++) {
                    var index = Math.floor(Math.random() * str.length);
                    if (num) {
                        num += str[index];
                    } else {
                        num = str[index]
                    }

                }
                $scope.yzcode = num;
            }

            codenum()
            $scope.changecode = function () {
                codenum()
            };
            //$scope.$watch('aaaa', function (n,o) {
            //    console.log(n);
            //})
            $scope.$watch('vm.code', function (n, o) {
                //console.log(n);
                //console.log($scope.yzcode);
                if (n == o) {
                    return
                }

                if (n !== $scope.yzcode) {
                    $scope.loginerror.codeerror = true
                } else {
                    $scope.loginerror.codeerror = false
                }
            })
            $scope.$watch('namespace', function (n, o) {
                //console.log('new1',n);
                if (n == '') {

                    clearInterval($rootScope.timer);
                }
            })
            $log.info('login');
            //newjs

            //credentials.region = 'cn-north-1'
            //localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password))
            //$rootScope.loding = true;
            //var deferred = $q.defer();
            //var req = {
            //    method: 'GET',
            //    timeout: deferred.promise,
            //    url: GLOBAL.signin_uri,
            //    headers: {
            //        'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
            //    }
            //};

            //localStorage.setItem('Auth', $base64.encode(credentials.username + ':' + credentials.password))
            function loadProject(name, callback) {
                // $log.info("load project");
                Project.get({}, function (data) {
                    callback(name, data)
                    //console.log("load project success", data);

                }, function (res) {
                    $log.info("find project err", res);
                });
            };
            if (GLOBAL.sso_switch === 'true') {
                sessiontoken.get(function (data) {
                    //console.log('data.access_token', data.access_token+','+data.access_token);
                    Cookie.set('df_access_token', data.access_token+','+data.access_token, 23 * 3600 * 1000);
                    Cookie.set('region', 'cn-north-1', 24 * 3600 * 1000);
                    $rootScope.region = Cookie.get('region');
                    User.get({name: '~'}, function (res) {
                        $rootScope.user = res;
                        loadProject(res.metadata.name,function (name, data) {
                            for (var i = 0; i < data.items.length; i++) {
                                if (data.items[i].metadata.name == name) {
                                    $rootScope.namespace = name;
                                    angular.forEach(data.items, function (item, i) {

                                        data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                                    })
                                    data.items.sort(function (x, y) {
                                        return x.sortname > y.sortname ? 1 : -1;
                                    });
                                    angular.forEach(data.items, function (project, i) {
                                        if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                            //console.log(project.metadata.annotations['openshift.io/display-name']);
                                            //data.items.push(project);
                                            data.items.unshift(project);

                                            data.items.splice(i + 1, 1);
                                        }
                                    });
                                    $rootScope.projects = data.items;
                                }
                            }
                            localStorage.setItem("code", 1);
                            $rootScope.loginyanzheng = false;
                            //获取套餐
                            //$rootScope.loding = false;
                            $state.go("console.dashboard", {namespace: $rootScope.namespace})

                        })
                    })

                })

            }




            //function denglu() {
            //
            //    $http(req).success(function (data) {
            //        //var arrstr = data.join(',');
            //        var arr = []
            //        //console.log(data);
            //        angular.forEach(data, function (token, i) {
            //            //arr.push(token.access_token)
            //            var index = token.region.split('-')[2]
            //            arr[index - 1] = token.access_token
            //
            //        })
            //
            //        var arrstr = arr.join(',');
            //        //console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&",arrstr);
            //        Cookie.set('df_access_token', arrstr, 23 * 3600 * 1000);
            //        //console.log(Cookie.get('df_access_token'));
            //
            //        Cookie.set('region', credentials.region, 24 * 3600 * 1000);
            //        $rootScope.region = Cookie.get('region');
            //
            //        User.get({name: '~', region: $rootScope.region}, function (res) {
            //
            //            $rootScope.user = res;
            //            //localStorage.setItem('cade',null)
            //            loadProject(credentials.username, function (name, data) {
            //                for (var i = 0; i < data.items.length; i++) {
            //                    if (data.items[i].metadata.name == name) {
            //                        $rootScope.namespace = name;
            //                        angular.forEach(data.items, function (item, i) {
            //
            //                            data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;
            //
            //
            //                        })
            //                        data.items.sort(function (x, y) {
            //                            return x.sortname > y.sortname ? 1 : -1;
            //                        });
            //                        angular.forEach(data.items, function (project, i) {
            //                            if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
            //                                //console.log(project.metadata.annotations['openshift.io/display-name']);
            //                                //data.items.push(project);
            //                                data.items.unshift(project);
            //
            //                                data.items.splice(i + 1, 1);
            //                            }
            //                        });
            //                        $rootScope.projects = data.items;
            //                    }
            //                }
            //                localStorage.setItem("code", 1);
            //                $rootScope.loginyanzheng = false;
            //                //获取套餐
            //                $rootScope.loding = false;
            //                $state.go("console.dashboard", {namespace: $rootScope.namespace})
            //                //跳转dashboard
            //
            //
            //                //$state.go("console.dashboard", { namespace: $rootScope.namespace });
            //
            //
            //            });
            //
            //
            //            //var inputDaovoice = function () {
            //            //    daovoice('init', {
            //            //        app_id: "b31d2fb1",
            //            //        user_id: "user.metadata.uid", // 必填: 该用户在您系统上的唯一ID
            //            //        //email: "daovoice@example.com", // 选填:  该用户在您系统上的主邮箱
            //            //        name: $rootScope.user.metadata.name, // 选填: 用户名
            //            //        signed_up: parseInt((new Date($rootScope.user.metadata.creationTimestamp)).getTime() / 1000) // 选填: 用户的注册时间，用Unix时间戳表示
            //            //    });
            //            //    daovoice('update');
            //            //}
            //            //inputDaovoice();
            //        });
            //
            //    }).error(function (data) {
            //        //console.log(data);
            //        //if (data.code == 401) {
            //        //  //$rootScope.user=false;
            //        //  $rootScope.loding = false;
            //        //}
            //        $state.go('login');
            //        console.log('登录报错', data);
            //        if (data.code === 1401) {
            //            $rootScope.loding = false;
            //            Alert.open('请重新登录', '用户名或密码不正确');
            //            var codenum = localStorage.getItem("code");
            //            //console.log(codenum);
            //            if (codenum) {
            //                codenum = parseInt(codenum);
            //                codenum += 1
            //                localStorage.setItem('code', codenum);
            //                if (codenum > 3) {
            //                    $rootScope.loginyanzheng = true;
            //                }
            //
            //            } else {
            //                localStorage.setItem('code', 1)
            //            }
            //        }
            //        //var daovoicefailed = function () {
            //        //    daovoice('init', {
            //        //        app_id: "b31d2fb1"
            //        //    });
            //        //    daovoice('update');
            //        //}
            //        //daovoicefailed();
            //
            //
            //        //if (data.indexOf('502') != -1) {
            //        //    //$rootScope.loding = false;
            //        //    //alert('超时了');
            //        //    //denglu();
            //        //
            //        //    return;
            //        //} else {
            //        //
            //        //
            //        //
            //        //
            //        //}
            //
            //    });
            //
            //}







            $scope.login = function () {
                if ($stateParams.type) {
                    AuthService.login($rootScope.credentials, $stateParams);
                } else {
                    AuthService.login($rootScope.credentials);
                }

            };
            $scope.regist = function () {
                //ModalRegist.open();
                $state.go('regist');
            };
             $scope.cancel = function () {
               $uibModalInstance.dismiss();
             };
        }]);
