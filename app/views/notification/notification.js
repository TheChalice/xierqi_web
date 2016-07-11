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
]) .controller('notificationCtrl', ['$http','Addmodal','Confirm','$scope',
  function ($http,Addmodal,Confirm,$scope) {
    $scope.grid={
      st:null,
      et:null,
      auto:null
    }
    // $http({
    //   method:'GET',
    //   url:'/lapi/inbox?type={type}&sender={sender}&status={status}&level={level}&page={page}&size={size}',
    //   params:{
    //     'username':'tan'
    //   });
    $http({
      url:'/lapi/inbox',
      method:'GET',
      params:{
        'type':'sitenotify',
        'page':1,
        'size':10,
      }
    }).success(function(data){
        console.log('inbox',data)
    }).error(function(data,header,config,status){
    });

  }])

