'use strict';
angular.module('home.uploadimage', [])
    .controller('uploadimageCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject','$scope','FileUploader',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject,$scope,FileUploader) {
                $scope.uploadStatus = $scope.uploadStatus1 = false; //定义两个上传后返回的状态，成功获失败
                var uploader = $scope.uploader = new FileUploader({
                        url: 'http://192.168.1.103:10012/resume/jiangtong/aaa/bbb/jiangtong/88888888',
                        queueLimit: 1,     //文件个数
                        removeAfterUpload: true   //上传后删除文件
                });

                $scope.clearItems = function(){    //重新选择文件时，清空队列，达到覆盖文件的效果
                        uploader.clearQueue();
                }

                uploader.onAfterAddingFile = function(fileItem) {
                        console.log(fileItem);
                        $scope.fileItem = fileItem._file;    //添加文件之后，把文件信息赋给scope
                };

                uploader.onSuccessItem = function(fileItem, response, status, headers) {
                        $scope.uploadStatus = true;   //上传成功则把状态改为true
                };
                //uploader1.onSuccessItem = function(fileItem,response, status, headers){
                //        $scope.uploadStatus1 = true;
                //}
                $scope.UploadFile = function(){
                        uploader.uploadAll();
                        //uploader1.uploadAll();
                        //if(status){
                        //        if(status1){
                        //                alert('上传成功！');
                        //        }else{
                        //                alert('证书成功！私钥失败！');
                        //        }
                        //}else{
                        //        if(status1){
                        //                alert('私钥成功！证书失败！');
                        //        }else{
                        //                alert('上传失败！');
                        //        }
                        //}
                }
        }]);
