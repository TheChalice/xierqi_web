'use strict';

angular.module('console.user', [
  'kubernetesUI',
  {
    files: [
      'views/user/user.css',
      'components/datepick/datepick.js',
      'components/timeline/timeline.js',
      'components/checkbox/checkbox.js'
    ]
  }
]) .controller('userCtrl', ['$scope', 'ModalPwd',
  function ($scope, ModalPwd) {
    $scope.grid={
      st:null,
      et:null
    }
  $scope.updatePwd = function() {
    ModalPwd.open();
  };
  }])

