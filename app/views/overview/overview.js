'use strict';

angular.module('overview', [
        {
            files: [
                'components/header/header.js',
                'views/overview/overview.css'
            ]
        }
    ])
    .controller('overviewCtrl', ['$scope','$rootScope','Cookie','user',
        function ($scope,$rootScope,Cookie,user) {
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
        }]);

