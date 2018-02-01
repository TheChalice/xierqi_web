'use strict';

define(['angular'], function(angular) {
    return angular.module('myApp.controller', [])
        .controller('ConfirmReplaceModalController', function($scope, $uibModalInstance) {
            $scope.replace = function() {
                $uibModalInstance.close('replace');
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        });
})