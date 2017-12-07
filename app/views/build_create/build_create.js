'use strict';
angular.module('console.build_create_new', [
        {
            files: [
                'views/build_create/build_create.css'
            ]
        }
    ])
    .controller('BuildCreateCtrl', ['createdeploy','randomWord', '$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch', 'labOwner', 'psgitlab', 'laborgs', 'labBranch', 'ImageStream', 'BuildConfig', 'Alert', '$http', 'Cookie', '$base64', 'secretskey',
        function (createdeploy,randomWord, $rootScope, $scope, $state, $log, Owner, Org, Branch, labOwner, psgitlab, laborgs, labBranch, ImageStream, BuildConfig, Alert, $http, Cookie, $base64, secretskey) {


        }]);

