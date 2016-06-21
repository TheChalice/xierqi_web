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
]) .controller('userCtrl', ['$scope',
  function ($scope) {
    $scope.grid={
      st:null,
      et:null
    }
    
  }])

