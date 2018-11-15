'use strict';

angular.module('console', [
        {
            files: [
                'components/header/header.js',
                'components/sidebar/sidebar.js',
                'views/console/console.css'
            ]
        }
    ])
    .controller('ConsoleCtrl', ['creatproject', '$timeout', 'sessiontoken', 'regions', 'account', '$http', '$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', 'Cookie', '$state', 'GLOBAL', '$stateParams', '$location', 'userNum',
        function (creatproject, $timeout, sessiontoken, regions, account, $http, $rootScope, $scope, $log, AUTH_EVENTS, User, user, Project, Cookie, $state, GLOBAL, $stateParams, $location, userNum) {
            $scope.showAbout = true;
            //console.log('$state', $state);
            // 获取当前登录用户名
            var namespace = Cookie.get('namespace')
            // 铃铛上的数字
            //var inituserNum = function () {
            //function a() {
            //userNum.get({namespace: namespace},
            //    function (res) {
            //        $scope.numbertotal = res.total;
            //    }
            //);
            //}();

            //inituserNum();

            // console.log('$stateParams', $stateParams);
            // console.log('$location', $location);

            if (GLOBAL.sso_switch === 'true') {
                if (!Cookie.get('df_access_token')) {
                    Cookie.set('df_access_token', user.access_token + ',' + user.access_token, 23 * 3600 * 1000);
                }
                if (!Cookie.get('region')) {
                    Cookie.set('region', 'cn-north-1', 24 * 3600 * 1000);
                }

                //Cookie.set('df_access_token', user.access_token + ',' + user.access_token, 23 * 3600 * 1000);

                if ($stateParams.namespace) {
                    if ($rootScope.user) {
                        // console.log('$rootScope.user', $rootScope.user.metadata.name);
                    } else {

                        $rootScope.user = {
                            metadata: {
                                name: $stateParams.namespace
                            }
                        };
                    }
                    var namespace = Cookie.get('namespace');

                    var region = Cookie.get('region');
                    if (region) {
                        $rootScope.region = region;
                    } else {
                        console.log('noregion');
                        $rootScope.region = 'cn-north-1';
                        Cookie.set('region', $rootScope.region, 10 * 365 * 24 * 3600 * 1000);
                    }

                    if (namespace) {
                        $rootScope.namespace = namespace;
                    } else {
                        //console.log('nonamespace');
                        $rootScope.namespace = $rootScope.user.metadata.name;
                        Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    }
                }

            } else {
                if ($rootScope.user) {
                    // console.log('$rootScope.user', $rootScope.user.metadata.name);
                } else {

                    $rootScope.user = user;
                }
                var namespace = Cookie.get('namespace');
                var region = Cookie.get('region');
                if (region) {
                    $rootScope.region = region;
                } else {
                    // console.log('noregion');
                    $rootScope.region = 'cn-north-1';
                    Cookie.set('region', $rootScope.region, 10 * 365 * 24 * 3600 * 1000);
                }

                if (namespace) {
                    $rootScope.namespace = namespace;
                } else {
                    //console.log('nonamespace');
                    $rootScope.namespace = $rootScope.user.metadata.name;
                    Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                }

            }

            //$log.info('Console', $state.current.name);


            if ($state.current.name === 'console.plan' || $state.current.name === 'console.pay' || $state.current.name === 'console.noplan') {
                $rootScope.showsidebar = false;
                $('#sidebar-right-fixed').css("marginLeft", 0)
            } else {
                $rootScope.showsidebar = true;
                $('#sidebar-right-fixed').css("marginLeft", 180)
            }


        }]);

