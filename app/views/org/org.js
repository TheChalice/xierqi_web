'use strict';

angular.module('console.user', [
  'kubernetesUI',
  {
    files: [
      'views/org/org.css',
      'components/datepick/datepick.js',
      'components/timeline/timeline.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('orgCtrl', ['$scope',
  function ($scope) {
    $scope.grid={
      st:null,
      et:null
    }
    
  }])

