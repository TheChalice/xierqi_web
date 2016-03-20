'use strict';

angular.module('console.build.create', [])
    .controller('BuildCreateCtrl', ['$scope', '$state', '$log', 'BuildConfig', 'Build', function ($scope, $state, $log, BuildConfig, Build) {
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
                }
            }
        };

        $scope.create = function() {
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
                $state.go('console.build_detail', {name: name})
            }, function(res){
                //todo 错误处理
            });
        };
    }]);

