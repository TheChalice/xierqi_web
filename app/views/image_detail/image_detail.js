'use strict';

angular.module('console.image_detail', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/image_detail/image_detail.css'
        ]
    }
])
    .controller('ImageDetailCtrl', ['Confirm', 'ModalPullImage', '$state', 'ImageStream', '$http', 'platformone', 'platformlist', '$location', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'ImageStreamImage',
        function (Confirm, ModalPullImage, $state, ImageStream, $http, platformone, platformlist, $location, $rootScope, $scope, $log, ImageStreamTag, ImageStreamImage) {


            $scope.name = $state.params.bc;
            ImageStream.get({
                namespace: $rootScope.namespace,
                name: $scope.name,
                region: $rootScope.region
            }, function (data) {
                //console.log(data)
                if (data.status.tags) {
                    //angular.forEach(data.status.tags, function (tag, i) {
                    //    data.status.tags[i].mysort = data.status.tags[i].items[0].created;
                    //    data.status.tags[i].mysort = (new Date(data.status.tags[i].mysort)).getTime()
                    //})
                    //data.status.tags.sort(function (x, y) {
                    //    return x.mysort > y.mysort ? -1 : 1;
                    //});
                }
                angular.forEach(data.status.tags, function (tag, i) {
                    //{{name}}:{{date.status.tags[0].items[0].image}}
                    //console.log(tag.tag);
                    data.status.tags[i].port = [];
                    if (data.status.tags[0].items[0].image) {
                        ImageStreamImage.get({
                            namespace: $rootScope.namespace,
                            name: $scope.name + '@' + data.status.tags[0].items[0].image,
                            region: $rootScope.region
                        }, function (newdata) {
                            // console.log('newdata', newdata);
                            //for( var k in newdata.image.dockerImageMetadata.Config.ExposedPorts){
                            //    //console.log(k);
                            //    data.status.tags[i].port.push(k)
                            //
                            //}
                            data.status.tags[i].message = newdata;
                            //if (i === data.status.tags.length - 1) {
                            //    //console.log('date',data);
                            //    $scope.date = data;
                            //}


                        })
                    }

                });

                $scope.date = data;
                $scope.itemsCurIdx = $scope.date.status.tags[0].items.length - 1;
                console.log($scope.date);
            });

            $scope.pull = function (name) {
                var s = $scope.name;
                //console.log(name);
                var str = $scope.name + ':' + name;
                ModalPullImage.open(str, 'project')
                    .then(function (res) {

                        //console.log("cmd1", res);
                    });
            };
            $scope.delete = function (idx) {


                var title = "删除镜像版本";
                var msg = "您确定要删除该镜像版本吗?";
                var tip = "";


                Confirm.open(title, msg, tip, 'recycle').then(function () {
                    //console.log($scope.date)
                    var name = $scope.date.status.tags[idx].tag;
                    // alert(name)master
                    if (!name) {
                        return;
                    }
                    ImageStreamTag.delete({
                        namespace: $rootScope.namespace,
                        name: $scope.name + ':' + name,
                        region: $rootScope.region
                    }, function (data) {
                        for (var i = 0; i < $scope.date.status.tags.length; i++) {
                            if (name == $scope.date.status.tags[i].tag) {
                                $scope.date.status.tags.splice(i, 1)
                            }
                        }
                    })
                })
            };
        }]);