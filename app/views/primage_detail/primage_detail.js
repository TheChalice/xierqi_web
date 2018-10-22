'use strict';

angular.module('console.image_detail', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/primage_detail/primage_detail.css'
            ]
        }
    ])
    .controller('prImageDetailCtrl', ['registryptag','Confirm','ModalPullImage', '$state', 'ImageStream', '$http', 'platformone', 'platformlist', '$location', '$rootScope', '$scope', '$log', 'ImageStreamTag', '$stateParams','Sort',
        function (registryptag,Confirm,ModalPullImage, $state, ImageStream, $http, platformone, platformlist, $location, $rootScope, $scope, $log, ImageStreamTag, $stateParams,Sort) {
            //var namespace=$stateParams.name.split('/')[0];
            //var name=$stateParams.name.split('/')[1];

            registryptag.query({reponame:$stateParams.name}, function (tags) {
                //console.log('tag', tags);


                $scope.imagename = $stateParams.name
                angular.forEach(tags, function (tag,i) {
                    tag.metadata={
                        creationTimestamp:tag.created
                    }
                })
                $scope.tags = Sort.sort(tags, -1); //排序
                //$scope.tags=tags;

                //console.log('$scope.primage', $scope.primage);
            })
            $scope.pull = function (name) {
                var s = $scope.imagename;
                //console.log(name);
                var str =s + ':' + name
                ModalPullImage.open(str)
                    .then(function (res) {

                        //console.log("cmd1", res);
                    });
            };


        }]);