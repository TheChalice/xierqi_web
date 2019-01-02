(function () {
    'use strict';
    angular.module('console.import_to_file', [{
        files: [
            'views/import_to_file/to_file.css'
        ]
    }])

        .controller('ImportToFileCtrl', ['$scope', '$timeout', 'project','$state', '$rootScope'
            , function ($scope, $timeout, project,  $rootScope,$state) {
            }]);
})();