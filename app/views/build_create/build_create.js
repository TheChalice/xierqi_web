'use strict';

angular.module('console.build.create', [])
    .controller('BuildCreateCtrl', ['$rootScope', '$scope', '$state', '$log', 'BuildConfig', 'Build', 'ImageStream', 'UUID', 'Alert', function ($rootScope, $scope, $state, $log, BuildConfig, Build, ImageStream, UUID, Alert) {
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
                        //ref: ''
                    }

                },
                strategy: {
                    type: 'Docker'
                },
                output: {
                    to: {
                        kind: 'ImageStreamTag',
                        name: ''
                    }
                },
                completionDeadlineSeconds: 1800
            }
        };
        $scope.completionDeadlineMinutes = 30;

        $scope.create = function() {
            $scope.creating = true;
            var imageStream = {
                metadata: {
                    name: $scope.buildConfig.metadata.name
                }
            };
            ImageStream.create({namespace: $rootScope.namespace}, imageStream, function (res) {
                $log.info("imageStream", res);
                createBuildConfig(res.metadata.name);
            }, function(res){
                $log.info("err", res);
                if (res.data.code == 409) {
                    createBuildConfig($scope.buildConfig.metadata.name);
                } else {
                    Alert.open('错误', res.data.message, true);
                    $scope.creating = false;
                }
            });
        };

        var createBuildConfig = function (imageStreamTag) {
            $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
            $scope.buildConfig.spec.output.to.name = imageStreamTag;// + ':latest';
            $scope.buildConfig.spec.triggers = [];
            BuildConfig.create({namespace: $rootScope.namespace}, $scope.buildConfig, function(res){
                $log.info("buildConfig", res);
                createBuild(res.metadata.name);
                $scope.creating = false;
            }, function(res){
                $scope.creating = false;
                if (res.data.code == 409) {
                    Alert.open('错误', "构建名称重复", true);
                } else {
                    Alert.open('错误', res.data.message, true);
                }
            });
        };

        var createBuild = function(name) {
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({namespace: $rootScope.namespace, name: name}, buildRequest, function(){
                $log.info("build instantiate success");
                $state.go('console.build_detail', {name: name, from: 'create'})
            }, function(res){
                //todo 错误处理
            });
        };
    }]);

