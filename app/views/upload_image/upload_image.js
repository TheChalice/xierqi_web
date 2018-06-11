'use strict';
angular.module('home.uploadimage', [{
        files: [
            'views/upload_image/upload_image.css'
        ]
    }])
    .controller('uploadimageCtrl', ['progressBox','GLOBAL', 'sessiontoken', 'Cookie', '$rootScope', 'User', 'Project', '$log', '$state', 'ImageStream', '$scope', 'Upload', 'toastr',
        function (progressBox,GLOBAL, sessiontoken, Cookie, $rootScope, User, Project, $log, $state, ImageStream, $scope, Upload, toastr) {

            $scope.grid = {
                tag: null,
                file: null,
                name: null,
                progress: null,
                imagenamenull:false,
                clickbtn: 'canclick',
                display: false
            }
            $scope.submit = function (file) {
                //console.log('file', file);
                $scope.grid.imagenamenull = false
                if (!$scope.grid.name) {
                    $scope.grid.imagenamenull = true
                    return
                }
                if (!$scope.grid.tag) {
                    $scope.grid.tag = 'latest'
                }

                $scope.grid.clickbtn = 'inhand'
                browserMD5File($scope.grid.file, function (err, md5) {
                    $scope.grid.clickbtn = 'dontclick';
                    $('#myModalBtn').click();
                    // progressBox.open($scope.grid.progress);
                    //console.log('md5',md5); // 97027eb624f85892c69c4bcec8ab0f11

                    $scope.upload(file, $scope.grid.name, $scope.grid.tag, md5);
                });
                //if (file) {
                //
                //}
            };
            $scope.changeupload = function ($files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event) {
                //console.log('change', $files, $file, $newFiles, $duplicateFiles, $invalidFiles, $event);
                $scope.grid.file = $event.target.files[0];
                console.log(' $scope.grid.file', $scope.grid.file);


            }
            $scope.changenewimage = function (idx) {
                if($scope.myis){
                    if (idx == 1) {
                        $scope.grid.name = $scope.myis[0].metadata.name
                        $scope.grid.tag = $scope.myis[0].status.tags[0].tag
                    } else {
                        $scope.grid.name = null
                        $scope.grid.tag = null
                    }
                }
            }
            // upload on file select or drop
            $scope.upload = function (file, image, tag, md5) {
                //console.log('files', file);
                var tokens = Cookie.get('df_access_token');
                var tokenarr = tokens.split(',')
                Upload.upload({
                    url: 'http://127.0.0.1:8080/uploadimage/' + $rootScope.namespace + '/' + image + '/' + tag,
                    data: {file: file, 'total': file.size},
                    headers: {'Authorization': "Bearer " + tokenarr[0]},
                    resumeSizeUrl: 'http://127.0.0.1:8080/uploadimage/' + $rootScope.namespace + '/info?secret=' + md5 + '&total=' + file.size,
                    resumeSizeResponseReader: function (data) {
                        //console.log('data', data);

                        return data.size;
                    },
                    resumeChunkSize: 1000000,

                }).then(function (resp) {
                    $scope.grid.clickbtn = 'canclick'
                    toastr.success('上传成功', {
                        closeButton: true
                    });
                    $state.go("console.image", {namespace: $rootScope.namespace});
                    console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                }, function (resp) {
                    console.log('Error status: ' + resp.status);
                }, function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    $scope.grid.progress = progressPercentage;
                    console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                });
            };
            $scope.changename = function (item) {
                $scope.grid.name = item.metadata.name
                $scope.myistag = item.status.tags
                $scope.grid.tag = item.status.tags[0].tag
            }
            $scope.changetag = function (tag) {

                $scope.grid.tag = tag.tag
            }

            //// for multiple files:
            //$scope.uploadFiles = function (files) {
            //        if (files && files.length) {
            //
            //                //for (var i = 0; i < files.length; i++) {
            //                //        Upload.upload({..., data: {file: files[i]}, ...})...;
            //                //}
            //                //// or send them all together for HTML5 browsers:
            //                //Upload.upload({..., data: {file: files}, ...})...;
            //        }
            //}

            $scope.isForget = false;

            ImageStream.get({namespace: $rootScope.namespace}, function (datalist) {
                console.log('is', datalist.items);
                $scope.myis = []
                angular.forEach(datalist.items, function (item, i) {
                    if (item.status.tags && item.status.tags.length) {
                        $scope.myis.push(item)
                    }

                })

                $scope.grid.name = $scope.myis[0].metadata.name
                $scope.grid.tag = $scope.myis[0].status.tags[0].tag
                $scope.myistag = $scope.myis[0].status.tags

            })
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

                        $scope.grid.tag = $scope.myistag[0].tag
                    }
                }
            }
        }]);

