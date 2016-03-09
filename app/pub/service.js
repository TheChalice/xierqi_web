'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.service', [])
        .service('Confirm', ['$uibModal', function ($uibModal) {
            this.open = function (txt) {
                return $uibModal.open({
                    templateUrl: 'tpl/confirm.html',
                    size: 'sm',
                    controller: function ($scope, $uibModalInstance, txt) {
                        $scope.txt = txt;
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                    },
                    resolve: {
                        txt: function () {
                            return txt;
                        }
                    }
                }).result;
            };
        }])
        .service('Alert', ['$uibModal', function ($uibModal) {
            this.open = function (txt, err) {
                return $uibModal.open({
                    templateUrl: 'tpl/alert.html',
                    size: 'sm',
                    controller: function ($scope, $uibModalInstance, txt) {
                        $scope.txt = txt;
                        $scope.err = err;
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    },
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
        }]);
});
