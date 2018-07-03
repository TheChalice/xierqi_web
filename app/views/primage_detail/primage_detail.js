'use strict';

angular.module('console.primage', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/primage_detail/primage_detail.css'
            ]
        }
    ])
    .controller('prImageDetailCtrl', ['platform','registryptag', 'Confirm', 'ModalPullImage', '$state', 'ImageStream', '$http', 'platformone', 'platformlist', '$location', '$rootScope', '$scope', '$log', 'ImageStreamTag', '$stateParams', 'Sort','imagestreamimports','GLOBAL',
        function (platform,registryptag, Confirm, ModalPullImage, $state, ImageStream, $http, platformone, platformlist, $location, $rootScope, $scope, $log, ImageStreamTag, $stateParams, Sort,imagestreamimports,GLOBAL) {
            //var namespace=$stateParams.name.split('/')[0];
            //var name=$stateParams.name.split('/')[1];
            $scope.imagename = $stateParams.name;
            $scope.project_id = $stateParams.id;
            $scope.curImgCon = null;
            platform.query({ id: $scope.project_id }, function (images) {
                angular.forEach(images, function (image, i) {

                    if($scope.imagename == image.name){
                        $scope.curImgCon = image;
                    }
                })
                console.log('$scope.curImgCon', $scope.curImgCon);
            })
            console.log('$scope.project_id', $scope.project_id);
            $scope.postobj = {
                "kind": "ImageStreamImport",
                "apiVersion": "v1",
                "metadata": {"name": "newapp", "namespace": $rootScope.namespace},
                "spec": {
                    "import": false,
                    "images": [
                        {
                            "from": {
                                "kind": "DockerImage",
                                "name": ""
                            }

                        }
                    ]


                },
                "status": {}
            }
            $scope.postobj.spec.images[0].importPolicy = {
                insecure: true
            }


            registryptag.query({reponame: $stateParams.name}, function (tags) {
                //console.log('tag', tags);
                angular.forEach(tags, function (tag, i) {
                    tags[i].metadata = {
                        creationTimestamp: tag.created
                    }
                })
                $scope.tags = Sort.sort(tags, -1);
                angular.forEach($scope.tags, function (tag, i) {
                    $scope.postobj.spec.images[0].from.name = GLOBAL.common_url+'/'+$scope.imagename+':'+tag.name;
                    $scope.tags[i].postobj =$scope.postobj

                        //console.log('$scope.postobj.spec.images[0].from.name', .spec.images[0].from.name);
                    imagestreamimports.create({namespace: $rootScope.namespace}, $scope.postobj, function (images) {

                        $scope.tags[i].images = images;

                        //console.log('tag', tag);
                    })

                })
                 //排序
                console.log('$scope.tags', $scope.tags);
                //$scope.tags=tags;

                $scope.tagsCurIdx = $scope.tags.length-1;

            })
            $scope.pull = function (name) {
                var s = $scope.imagename;
                //console.log(name);
                var str = s + ':' + name
                ModalPullImage.open(str)
                    .then(function (res) {

                        //console.log("cmd1", res);
                    });
            };


        }]);