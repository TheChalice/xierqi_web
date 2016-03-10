'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'Build', function ($scope, $log, $stateParams, Build) {
        $scope.namespace = $stateParams.namespace || 'default';

        var loadBuilds = function() {
            Build.get({namespace: $scope.namespace}, function(data){
                $log.info('data', data);
            })
        };

        loadBuilds();


    }]);

