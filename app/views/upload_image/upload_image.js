'use strict';
angular.module('home.uploadimage', [ {
            files: [
                    'views/upload_image/upload_image.css'
            ]
    }])
    .controller('uploadimageCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject','$scope','Upload',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject,$scope,Upload) {
                $scope.submit = function() {
                        if ($scope.form.file.$valid && $scope.file) {

                                $scope.upload($scope.file);
                        }
                };

                // upload on file select or drop
                $scope.upload = function (file) {
                        console.log('files', file);
                        Upload.upload({
                                url: 'http://localhost:8080/uploadimage/jiangtong/aaa/bbb/jiangtong/88888888',
                                data: {file: file, 'username': $scope.username},
                                resumeSizeUrl: 'http://localhost:8080/uploadimage/jiangtong/info',
                                resumeSizeResponseReader: function(data) {
                                        console.log('data', data);
                                        return data.size;
                                },
                                resumeChunkSize:99000,

                        }).then(function (resp) {
                                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
                        }, function (resp) {
                                console.log('Error status: ' + resp.status);
                        }, function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                        });
                };
                // for multiple files:
                $scope.uploadFiles = function (files) {
                        if (files && files.length) {

                                //for (var i = 0; i < files.length; i++) {
                                //        Upload.upload({..., data: {file: files[i]}, ...})...;
                                //}
                                //// or send them all together for HTML5 browsers:
                                //Upload.upload({..., data: {file: files}, ...})...;
                        }
                }
                //选项卡切换
                $scope.images = {}//需要真实数据，进行中
                $scope.checkoutreg = function (con, status) {
                        if (con.display === status) {
                        } else {
                                con.display = !con.display
                        }
                }
                //tag内容切换
                $scope.name = "John Doe"; //需要真实数据，进行中
                $scope.isOK = true;
                $scope.isselect = false;
                $scope.save = function () {
                        if (!$scope.deadlineMinutesEnable) {
                                $scope.deadlineMinutesEnable = true;
                                $scope.isOK = false;
                                $scope.isselect = true;
                                return;
                        } else {
                                $scope.deadlineMinutesEnable = false;
                                $scope.isOK = true;
                                $scope.isselect = false;
                        }
                }
        }]);

