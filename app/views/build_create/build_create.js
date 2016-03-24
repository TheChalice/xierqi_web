'use strict';

angular.module('console.build.create', [])
    .controller('BuildCreateCtrl', ['$scope', '$state', '$log', 'BuildConfig', 'Build', 'ImageStream', function ($scope, $state, $log, BuildConfig, Build, ImageStream) {
        $log.info('BuildCreate');

        $scope.buildConfig = {
            metadata: {
                name: ''
            },
            spec: {
                triggers: [],
                source: {
                    type: 'Git',
                    git: {
                        uri: ''
                    }
                },
                strategy: {
                    type: 'Docker'
                },
                output: {
                    to: {
                        kind: 'ImageStreamTag',
                        name: ''    //镜像名指定为buildonfig名
                    }
                },
                completionDeadlineSeconds: 1800
            }
        };
        $scope.completionDeadlineMinutes = 30;

        $scope.create = function() {
            var imageStream = {
                metadata: {
                    name: $scope.buildConfig.metadata.name
                },
                spec: {
                    tags: [
                        {name: 'latest'}
                    ]
                }
            };
            ImageStream.create({}, imageStream, function (res) {
                $log.info("imageStream", res);
                createBuildConfig(res.metadata.name);
            }, function(res){
                $log.info("err", res);
                if (res.data.code == 409) {
                    createBuildConfig($scope.buildConfig.metadata.name);
                } else {
                    //todo 错误处理
                }
            });
        };

        var createBuildConfig = function (imageStreamTag) {
            $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
            $scope.buildConfig.spec.output.to.name = imageStreamTag + ':latest';
            BuildConfig.create({}, $scope.buildConfig, function(res){
                $log.info("buildConfig", res);
                createBuild(res.metadata.name);
            }, function(res){
                //todo 错误处理代码
                $log.info("[err]", res);
            });
        };

        var createBuild = function(name) {
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({name: name}, buildRequest, function(){
                $log.info("build instantiate success");
                $state.go('console.build_detail', {name: name, from: 'create'})
            }, function(res){
                //todo 错误处理
            });
        };
    }]);

