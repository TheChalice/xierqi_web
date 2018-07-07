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
    .controller('ConsoleCtrl', ['creatproject','$timeout', 'sessiontoken', 'regions', 'account', '$http', '$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', 'Cookie', '$state',
        function (creatproject,$timeout, sessiontoken, regions, account, $http, $rootScope, $scope, $log, AUTH_EVENTS, User, user, Project, Cookie, $state) {

            //console.log('user', user);
            if (user) {

                if ($rootScope.user) {
                    console.log('$rootScope.user', $rootScope.user.metadata.name);
                } else {

                    $rootScope.user = user;
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

            //$log.info('Console', $state.current.name);



            if ($state.current.name === 'console.plan' || $state.current.name === 'console.pay' || $state.current.name === 'console.noplan') {
                $rootScope.showsidebar = false;
                $('#sidebar-right-fixed').css("marginLeft", 0)
            } else {
                $rootScope.showsidebar = true;
                $('#sidebar-right-fixed').css("marginLeft", 180)
            }

        }]);

