'use strict';

angular.module('console.build.create', [])
    .controller('BuildCreateCtrl', ['$scope', '$log', 'BuildConfig', function ($scope, $log, BuildConfig) {
        $log.info('BuildCreate');

        $scope.buildConfig = {
            metadata: {
                name: 'build-config-1'
            },
            spec: {
                triggers: [
                    {
                        type: 'GitHub',
                        github: {secret: 'uZqdAJzfCk_kiBxcc5HP'}
                    },
                    {
                        type: 'Generic',
                        generic: {secret: 'H-PE0qZxQRl8t0OnqMdv'}
                    },
                    {
                        type: 'ConfigChange'
                    },
                    {
                        type: 'ImageChange',
                        imageChange: {lastTriggeredImageID: 'library/golang@sha256:13d12e6cc7b066e26288915cbee72d44ff74482ab4810a2fb218801b3ed8c56e'}
                    }
                ],
                source: {
                    type: 'Git',
                    git: {
                        uri: 'https://github.com/dragon9783/docker-2048.git',
                        ref: 'master'
                    }
                },
                revision: {
                    type: 'Git',
                    git: {
                        commit: ''
                    }
                },
                strategy: {
                    type: 'Docker',
                    dockerStrategy: {
                        from: {
                            kind: 'ImageStreamTag',
                            name: 'golang:1.5'
                        }
                    }
                },
                output: {
                    to: {
                        kind: 'ImageStreamTag',
                        name: 'datafactory:latest'
                    }
                },
                resources: {

                }
            },
            status: {
                lastVersion: 1
            }
        };

        $scope.create = function() {
            BuildConfig.create({}, $scope.buildConfig, function(res){
                $log.info("buildConfig", res);
            }, function(res){
                //todo 错误处理代码
                $log.info("[err]", res);
            });
        }
    }]);

