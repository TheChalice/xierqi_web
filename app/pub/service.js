'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.service', [])
        .factory('AuthInterceptor', ['$rootScope', '$q', 'AUTH_EVENTS', function ($rootScope, $q, AUTH_EVENTS) {
            var CODE_MAPPING = {
                401: AUTH_EVENTS.loginNeeded,
                403: AUTH_EVENTS.httpForbidden,
                419: AUTH_EVENTS.loginNeeded,
                440: AUTH_EVENTS.loginNeeded
            };
            return {
                request: function (config) {
                    //console.log($httpProvider.default.headers.common["Authorization"]);

                    $rootScope.loading = true;
                    return config
                },
                requestError: function (rejection) {
                    $rootScope.loading = false;
                    return $q.reject(rejection);
                },
                response: function (res) {
                    $rootScope.loading = false;
                    return res;
                },
                responseError: function (response) {
                    $rootScope.loading = false;
                    var val = CODE_MAPPING[response.status];
                    if (val) {
                        $rootScope.$broadcast(val, response);
                    }
                    return $q.reject(response);
                }
            };
        }])
        .service('Confirm', ['$uibModal', function ($uibModal) {
            this.open = function (title, txt, tip, tp) {
                return $uibModal.open({
                    templateUrl: 'pub/tpl/confirm.html',
                    size: 'default',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.title = title;
                        $scope.txt = txt;
                        $scope.tip = tip;
                        $scope.tp = tp;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    }]
                }).result;
            };
        }])
        .service('Alert', ['$uibModal', function ($uibModal) {
            this.open = function (txt, err) {
                return $uibModal.open({
                    templateUrl: 'tpl/alert.html',
                    size: 'sm',
                    controller: ['$scope', '$uibModalInstance', 'txt', function ($scope, $uibModalInstance, txt) {
                        $scope.txt = txt;
                        $scope.err = err;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    }],
                    resolve: {
                        txt: function () {
                            return txt;
                        },
                        err: function () {
                            return err;
                        }
                    }
                }).result;
            };
        }])
        .service('Sort', [function(){
            this.sort = function (items, reverse) {
                if (!reverse || reverse == 0) {
                    reverse = 1;
                }
                items.sort(function(a, b){
                    if (!a.metadata) {
                        return 0;
                    }
                    return reverse * ((new Date(a.metadata.creationTimestamp)).getTime() - (new Date(b.metadata.creationTimestamp)).getTime());
                });
                return items;
            };
        }]);
});
