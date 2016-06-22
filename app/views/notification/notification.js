'use strict';

angular.module('console.notification', [
  'kubernetesUI',
  {
    files: [
      'views/notification/notification.css',
      'components/datepick/datepick.js',
      'components/messlist/messlist.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('notificationCtrl', ['Addmodal','Confirm','$scope',
  function (Addmodal,Confirm,$scope) {
    $scope.grid={
      st:null,
      et:null,
      auto:null
    }

  }])

