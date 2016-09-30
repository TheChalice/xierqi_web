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
            //$scope.where = function (now) {
            //    //console.log(now)
            //    $scope.whereclick = now
            //}
            if ($rootScope.user) {
                return $rootScope.user;
            }
            User.get({name: '~'}, function (res) {
                $rootScope.user = res;
            });
            //$scope.top = []
            //路由监听事件
            console.log($state.current.name);
            switch($state.current.name)
            {
                case 'home.index':
                    $scope.whereclick = '首页'
                    break;
                case 'home.introduce':
                    $scope.whereclick = '产品'
                    break;
                case 'home.application':
                    $scope.whereclick = '应用市场'
                    break;
                case 'home.index_backing_service':
                    $scope.whereclick = '服务市场'
                    break;
                default:
                    $scope.whereclick = '首页'
            }
            $rootScope.$on('$stateChangeStart',
                function (event, toState, toParams, fromState, fromParams) {
                    console.log(toState.name);
                    switch(toState.name)
                    {
                        case 'home.index':
                            $scope.whereclick = '首页'
                            break;
                        case 'home.introduce':
                            $scope.whereclick = '产品'
                            break;
                        case 'home.application':
                            $scope.whereclick = '应用市场'
                            break;
                        case 'home.index_backing_service':
                            $scope.whereclick = '服务市场'
                            break;
                        default:
                            $scope.whereclick = '首页'
                    }
                    if (toState.name !== "home.introduce") {
                        $('html').css('overflow','scroll');
                        window.onmousewheel = document.onmousewheel=true;
                    }else {
                        $('html').css('overflow','hidden');
                    }

                })
//            // stateChangeSuccess  当模板解析完成后触发
//            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
//                //console.log(event);
//                //console.log(toState);
//                //console.log(toParams);
//                //console.log(fromState);
//                //console.log(fromParams);
//            })
//
//            // $stateChangeError  当模板解析过程中发生错误时触发
//            $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
//                //console.log(event);
//                //console.log(toState);
//                //console.log(toParams);
//                //console.log(fromState);
//                //console.log(fromParams);
//            })
//
//            $scope.$watch('$viewContentLoading',function(event, viewConfig){
//                console.log('模板加载完成前');
//            });
//// 当视图加载完成，DOM渲染完成之后触发，视图所在的$scope发出该事件。
//            $scope.$watch('$viewContentLoaded',function(event){
//                console.log('模板加载完成后');
//            });
            $scope.login = function () {
                // ModalLogin.open();
                $state.go('login');
            };

            $scope.regist = function () {
                ModalRegist.open();
                //$state.go('regist');
            };
        }]);

