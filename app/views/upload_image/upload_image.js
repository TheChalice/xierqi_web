'use strict';
angular.module('home.uploadimage', [{
    files: [
        'views/upload_image/upload_image.css'
    ]
}])
    .controller('uploadimageCtrl', ['$location', 'GLOBAL', 'Cookie', '$rootScope', '$state', 'ImageStream', '$scope','toastr', '$interval', 'Upload','uploadimageapi',
        function ($location, GLOBAL, Cookie, $rootScope, $state, ImageStream, $scope, toastr, $interval, Upload,uploadimageapi) {
            var host = '';
            var tokens = Cookie.get('df_access_token');
            var tokenarr = tokens.split(',');
            $scope.file = {
                data: ''
            };
            $scope.manuallyupload = {
                addr: GLOBAL.private_url,
                token: tokenarr[0],
                namespace: Cookie.get('namespace')
            };
            if ($location.$$port) {
                host = $location.$$protocol + '://' + $location.$$host + ":" + $location.$$port
            } else {
                host = $location.$$protocol + '://' + $location.$$host
            }

            $scope.isHide = true;
            $scope.selectManualUpload = function () {
                $scope.isHide = false;
            };
            $scope.selectImageUpload = function () {
                $scope.isHide = true;
            };
            $scope.grid = {
                tag: null,
                isFile: false,
                file: null,
                name: null,
                progress: null,
                imagenamenull: false,
                clickbtn: 'dontclick',
                display: false
            };
            $scope.$watch('grid', function (n, o) {
                if ($scope.grid.name && $scope.grid.tag && $scope.grid.isFile) {
                    $scope.grid.clickbtn = 'canclick';
                } else {
                    $scope.grid.clickbtn = 'dontclick';
                }
            }, true);
            $scope.submit = function (file) {
                //console.log('file', $scope.form);
                console.log('file', $scope.file.data);
                $scope.grid.imagenamenull = false;
                if (!$scope.grid.name) {
                    $scope.grid.imagenamenull = true;
                    return
                }
                if (!$scope.grid.tag) {
                    $scope.grid.tag = 'latest'
                }

                $scope.grid.clickbtn = 'inhand';
                browserMD5File($scope.file.data, function (err, md5) {
                    $scope.grid.clickbtn = 'dontclick';
                    $('#myModalBtn').click();
                    // progressBox.open($scope.grid.progress);
                    //console.log('md5',md5); // 97027eb624f85892c69c4bcec8ab0f11

                    $scope.upload($scope.file.data, $scope.grid.name, $scope.grid.tag, md5);
                });
            };
            // upload on file select or drop
            $scope.upload = function (file, image, tag, md5) {
                Upload.upload({
                    url: host + '/uploadimage/' + $rootScope.namespace + '/' + image + '/' + tag,
                    data: {file: file, 'total': file.size},
                    headers: {'Authorization': "Bearer " + tokenarr[0]},
                    resumeSizeUrl: host + '/uploadimage/' + $rootScope.namespace + '/info?secret=' + md5 + '&total=' + file.size,
                    resumeSizeResponseReader: function (data) {
                        //console.log('data', data);

                        return data.size;
                    },
                    resumeChunkSize: 1000000

                }).then(function (resp) {
                    //$scope.grid.clickbtn = 'canclick'
                    $scope.timer = $interval(function () {
                        uploadimageapi.get({namespace: $rootScope.namespace}, function (data) {
                            console.log('data', data.msg);
                            if (data.msg === "image push complete") {
                                toastr.success('上传成功', {
                                    closeButton: true
                                });

                                $state.go("console.image", {namespace: $rootScope.namespace});
                            }

                        }, function (err) {
                            console.log('err', err);
                        })
                    }, 5000);


                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.grid.progress = progressPercentage;
                    if ($scope.grid.progress == 100) {
                        $('#close-this').click();
                    }
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            };
            $scope.changename = function (item) {
                $scope.grid.name = item.metadata.name;
                $scope.myistag = item.status.tags;
                $scope.grid.tag = item.status.tags[0].tag
            };
            $scope.changetag = function (tag) {

                $scope.grid.tag = tag.tag
            };
            $scope.$on('$destroy', function () {
                $interval.cancel($scope.timer);
            });

            $scope.isForget = false;

            ImageStream.get({namespace: $rootScope.namespace}, function (datalist) {
                console.log('is', datalist.items);
                $scope.myis = []
                angular.forEach(datalist.items, function (item, i) {
                    if (item.status.tags && item.status.tags.length) {
                        $scope.myis.push(item)
                    }

                });
                if ($scope.myis[0]) {
                    $scope.grid.name = $scope.myis[0].metadata.name
                    $scope.grid.tag = $scope.myis[0].status.tags[0].tag
                    $scope.myistag = $scope.myis[0].status.tags
                }


            });
            //$scope.images = res;
            //console.log('is', datalist.items);

            //tag内容切换
            //$scope.name = "John Doe"; //需要真实数据，进行中
            $scope.isOK = true;
            $scope.isselect = false;
            $scope.save = function () {
                if (!$scope.deadlineMinutesEnable) {
                    $scope.deadlineMinutesEnable = true;
                    $scope.isOK = false;
                    $scope.isselect = true;

                } else {
                    $scope.deadlineMinutesEnable = false;
                    $scope.isOK = true;
                    $scope.isselect = false;
                    if (!$scope.grid.tag) {
                        if ($scope.myistag) {
                            $scope.grid.tag = $scope.myistag[0].tag
                        }

                    }
                }
            }
        }]);

