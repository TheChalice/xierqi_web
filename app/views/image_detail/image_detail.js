'use strict';

angular.module('console.image_detail', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/timeline/timeline.js',
                'views/image_detail/image_detail.css'
            ]
        }
    ])
    .controller('ImageDetailCtrl', ['$http','platformone','platformlist','$location','$rootScope', '$scope', '$log', 'ImageStreamTag', '$stateParams',
      function ($http,platformone,platformlist,$location,$rootScope, $scope, $log, ImageStreamTag, $stateParams) {
        $log.info('ImageDetailCtrl');
        $scope.bcName = $stateParams.bc;
        
        var str = $location.url().split('/')[3];
        
        if (str.indexOf('~2F') != -1) {
          console.log(2)
          $scope.nameone=$location.url().split('/')[3].split('~2F').join('/');

          // console.log('$scope.name',$scope.nameone);
          platformlist.query({id:$scope.nameone},function (data) {
            // console.log('data',data);
            data.reverse();
            $scope.newname = data[0];
            var arr = [];
            for (var i = 0; i < data.length; i++) {
              $http.get('/registry/api/repositories/manifests',
                  {params: {repo_name: $scope.nameone,tag:data[i]}})
                  .success(function (datalis) {
                    arr.push(datalis)
                  }).then(function () {
                if (arr.length == data.length) {
                  for (var i = 0; i < arr.length; i++) {
                    arr[i].mysort = arr[i].Created;
                    arr[i].mysort = (new Date(arr[i].mysort)).getTime()
                  }
                  arr.sort(function (x, y) {
                    return x.mysort > y.mysort ? -1 : 1;
                  });
                  console.log(arr);
                  $scope.newlist=arr[0];
                }
              })
            }
          })
        }else {
          
          var loadImageDetail = function(){
            //传imagename的参数
            ImageStreamTag.get({namespace: $rootScope.namespace, name: $stateParams["name"]}, function(data){
              $log.info('data',data);
              $scope.data = data;

              var gitUrl = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.source-location'];
              var ref = data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];

              var matches = gitUrl.match(/^https:\/\/github.com\/([^/]+)\/([^.]+)(\.git)?$/);
              console.log('matches', matches);
              if(matches){
                loadReadme(matches[1], matches[2], ref);
              }
            }, function(res){
              //todo 错误处理
            });
          };

          loadImageDetail();

          var loadReadme = function(owner, repo, ref) {
            var url = 'https://raw.githubusercontent.com/'+ owner +'/'+ repo +'/'+ ref +'/README.md';
            $.get(url, function(data){
              $scope.readme = data;
              $scope.$apply();
            });
          };
        }



    }]);