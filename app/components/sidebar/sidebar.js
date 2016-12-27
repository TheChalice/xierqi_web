'use strict';

angular.module("console.sidebar", [
    {
        files: ['components/sidebar/sidebar.css']
    }
])

    .directive('cSidebar', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/sidebar/sidebar.html',
            controller: ['$state', '$scope', function($state, $scope){
                $scope.$state = $state;
                console.log($state.current.name);

                $scope.$watch('$state.current.name',function (n,o) {
                    //console.log('$state', n);
                    if (n === 'console.build_create_new' || n === 'console.build_detail'|| n==='console.build') {
                        $scope.build = true
                    }else {
                        $scope.build = false
                    }
                    //$scope.$apply()
                    //console.log('$scope.build', $scope.build);
                })
            }]
        }
    }]);

