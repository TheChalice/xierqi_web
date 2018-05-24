'use strict';
angular.module('home.uploadimage', [ {
            files: [
                    'views/upload_image/upload_image.css'
            ]
    }])
    .controller('uploadimageCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','ImageStream','$scope','Upload',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,ImageStream,$scope,Upload) {
                $scope.grid ={
                        tag:null,
                        name:null
                }
                $scope.submit = function(file) {
                        //console.log('$scope.file',$scope.file);
                        //console.log('$scope.file',$scope.form);
                        if (file) {
                                $scope.upload(file);
                        }
                };

                Upload.uploadchange= function (file) {
                        console.log('file', file);
                }
                // upload on file select or drop
                $scope.upload = function (file) {
                        //console.log('files', file);
                        var tokens = Cookie.get('df_access_token');
                        var tokenarr = tokens.split(',')
                        Upload.upload({
                                url: 'http://localhost:8080/uploadimage/jiangtong/aaa/bbb',
                                data: {file: file, 'total': file.size},
                                headers: {'Authorization': "Bearer "+tokenarr[0]},
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
                $scope.changename= function (item) {
                        $scope.grid.name=item.metadata.name
                        $scope.myistag = item.status.tags
                        $scope.grid.tag=item.status.tags[0].tag
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

                //选项卡切换
                $scope.images = {}//需要真实数据，进行中
                // $scope.checkoutreg = function (con, status) {
                //         console.log(con,status)
                //         if (con.display === status) {
                //                 con.display = !con.display
                //         } else {
                                
                //         }
                // }
                ImageStream.get({ namespace: $rootScope.namespace}, function (datalist) {
                        console.log('is', datalist.items);
                        $scope.myis=[]
                        angular.forEach(datalist.items, function (item,i) {
                            if (item.status.tags && item.status.tags.length) {
                                    $scope.myis.push(item)
                            }

                        })

                        $scope.grid.name=$scope.myis[0].metadata.name
                        $scope.grid.tag=$scope.myis[0].status.tags[0].tag

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
                                return;
                        } else {
                                $scope.deadlineMinutesEnable = false;
                                $scope.isOK = true;
                                $scope.isselect = false;
                        }
                }
        }]);

