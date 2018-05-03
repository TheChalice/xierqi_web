'use strict';

define(['angular'], function(angular) {
    return angular.module('myApp.modals', [])
        .controller('ConfirmReplaceModalController',['$scope','$uibModalInstance',
                            function($scope, $uibModalInstance) {

            $scope.replace = function() {
                $uibModalInstance.close('replace');
            };

            $scope.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
})