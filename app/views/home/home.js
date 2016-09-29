'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['$state', '$scope', '$rootScope', '$log', 'ModalLogin', 'ModalRegist', 'User',
        function ($state, $scope, $rootScope, $log, ModalLogin, ModalRegist, User) {
            $log.info('Home');
            $scope.$watch('namespace', function (n, o) {
                //console.log('new1',n);
                if (n == '') {

                    clearInterval($rootScope.timer)
                }
            })
            $scope.where = function (now) {
                //console.log(now)
                $scope.whereclick = now
            }
            if ($rootScope.user) {
                return $rootScope.user;
            }

            //路由监听事件
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    console.log(event);
                    console.log(toState);
                    if (toState.name !== "home.introduce") {
                        User.get({name: '~'}, function (res) {
                            $rootScope.user = res;
                        });
                    }
                    //console.log(toParams);
                    //console.log(fromState);
                    //console.log(fromParams);
                    //if (toState.name == "homePage") {
                    //    //获取参数之后可以调请求判断需要渲染什么页面，渲染不同的页面通过 $location 实现
                    //    if (toParams.id == 10) {
                    //        //$location.path();//获取路由地址
                    //        // $location.path('/validation').replace();
                    //        // event.preventDefault()可以阻止模板解析
                    //    }
                    //}
                })
            // stateChangeSuccess  当模板解析完成后触发
            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //console.log(event);
                //console.log(toState);
                //console.log(toParams);
                //console.log(fromState);
                //console.log(fromParams);
            })

            // $stateChangeError  当模板解析过程中发生错误时触发
            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
                //console.log(event);
                //console.log(toState);
                //console.log(toParams);
                //console.log(fromState);
                //console.log(fromParams);
            })

            $scope.$watch('$viewContentLoading',function(event, viewConfig){
                console.log('模板加载完成前');
            });
// 当视图加载完成，DOM渲染完成之后触发，视图所在的$scope发出该事件。
            $scope.$watch('$viewContentLoaded',function(event){
                console.log('模板加载完成后');
            });
            $scope.login = function () {
                // ModalLogin.open();
                $state.go('login');
            };

            $scope.regist = function () {
                ModalRegist.open();
                //$state.go('regist');
            };
        }]);

