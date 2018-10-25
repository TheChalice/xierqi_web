'use strict';
angular.module('console.noproject', [ {
            files: [
                    'components/header/header.js',
                    'components/sidebar/sidebar.js',
                    'views/console/console.css'
            ]
    }])
    .controller('noprojectCtrl', ['$scope','GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject','$stateParams',
        function ($scope,GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject,$stateParams) {
                $scope.showAbout = false;
        }]);
