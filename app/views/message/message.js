'use strict';

angular.module('console.user', [
  'kubernetesUI',
  {
    files: [
      'views/message/message.css',
      'components/datepick/datepick.js',
      'components/messlist/messlist.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('messageCtrl', ['Addmodal','Confirm','$scope',
  function (Addmodal,Confirm,$scope) {
    $scope.grid={
      st:null,
      et:null,
      auto:null
    }

  }])

