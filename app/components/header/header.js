'use strict';

angular.module("console.header", [
    {
        files: ['components/header/header.css']
    }
])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html',
            controller: ['$scope', '$window', '$state', function($scope, $window, $state){
                $scope.back = function(){
                    $window.history.back();
                };
                $scope.hasBack = function(){
                    if ($state.current.name == "console.build") {
                        return false
                    }
                    return true;
                }
            }]
        }
    }])
    .filter('stateTitleFilter', [function(){
        return function(state) {
            switch (state) {
                case "console.build":
                    return "代码构建";
                case "console.build_create":
                    return "新建构建";
                case "console.build_detail":
                    return "构建详情";
                default:
                    return ""
            }
        };
    }]);

