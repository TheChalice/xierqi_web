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
            controller: ['$rootScope', '$scope', '$window', '$state', 'Cookie', function($rootScope, $scope, $window, $state, Cookie){
                $scope.back = function(){
                    $window.history.back();
                };
                $scope.hasBack = function(){
                    if ($state.current.name == "console.build" || $state.current.name == "console.image" || $state.current.name == "console.service" || $state.current.name == "console.backing_service") {
                        return false
                    }
                    return true;
                };
                $scope.logout = function(){
                    Cookie.clear('df_access_token');
                    $rootScope.user = null;
                    $rootScope.namespace = "";
                    $state.go('login');
                };
            }]
        }
    }])
    .filter('stateTitleFilter', [function(){
        return function(state) {
            switch (state) {
                case "console.dashboard":
                    return "仪表盘"
                case "console.build":
                    return "代码构建";
                case "console.build_create":
                    return "新建构建";
                case "console.build_detail":
                    return "构建详情";
                case "console.image":
                    return "镜像仓库";
                case "console.image_detail":
                    return "镜像仓库";
                case "console.service":
                    return "服务部署";
                case "console.service_detail":
                    return "服务详情";
                case "console.service_create":
                    return "新建服务";
                case "console.backing_service":
                    return "后端服务";
                case "console.backing_service_detail":
                    return "后端服务详情";
                case "console.apply_instance":
                    return "新建后端服务实例";
            }
        };
    }]);

