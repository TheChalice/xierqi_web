'use strict';
angular.module('console.build_create_new', [
    {
        files: [
        ]
    }
])
    .controller ('BuildcCtrl', ['$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch', 'ImageStream', 'BuildConfig', 'Alert', function($rootScope, $scope, $state, $log, Owner, Org, Branch, ImageStream, BuildConfig, Alert) {
        $scope.ishide = true;
        $scope.buildConfig = {
            metadata: {
                name: ''
            },
            spec: {
                triggers: [],
                source: {
                    type: 'Git',
                    git: {
                        uri: '',
                        ref: ''
                    },
                    sourceSecret: {
                        name: ''
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
        var thisindex = 0;

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

            var createBuildConfig = function() {
                $scope.buildConfig.spec.completionDeadlineSeconds = $scope.completionDeadlineMinutes * 60;
                $scope.buildConfig.spec.source.git.ref = $scope.branch[$scope.grid.branch].commit.sha;
                $scope.buildConfig.spec.source.sourceSecret.name = $scope.owner.secret;
                $scope.buildConfig.spec.source.git.uri = $scope.usernames[$scope.grid.user].repos[$scope.grid.project].clone_url;
                $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ":" + $scope.branch[$scope.grid.branch].name;
                BuildConfig.create({namespace: $rootScope.namespace},$scope.buildConfig, function(res){
                    $log.info("buildConfig",res);
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

        $scope.usernames = [];
        $scope.refresh = function() {
            $scope.ishide= false;
            Owner.query({namespace: $rootScope.namespace},function(res) {
                $log.info("owner", res);
                $scope.owner = res.msg;
                for(var i = 0 ; i < res.msg.infos.length;i++){
                    $scope.usernames.push(res.msg.infos[i]);
                    for(var j = 0; j < res.msg.infos[i].repos.length;j++){
                        res.msg.infos[i].repos[j].loginname = res.msg.infos[i].login;
                    }
                }
                $log.info("userProject", $scope.login);
            },function(data){
                $log.info('-=-=-=-=',data);
                if (data.status == 401) {
                    if (data.data.code == 1401){
                        //goto github
                    }
                }
            });
            Org.get(function(data) {
                $log.info("org", data);
                for(var i = 0 ; i < data.msg.length;i++){
                    $scope.usernames.push(data.msg[i]);
                    for(var j = 0; j < data.msg[i].repos.length;j++){
                        data.msg[i].repos[j].loginname = data.msg[i].login;
                    }
                }
            });
        }

        $scope.grid = {
            users: null,
            project: null,
            branch: null
        };
        $scope.selectUser = function(idx) {
            $scope.grid.user = idx;
            $scope.reposobj = $scope.usernames[idx].repos;
            thisindex = idx;
            $log.info('$scope.projectList.reposobj',$scope.reposobj);
        }
        $scope.selectProject = function(idx) {
            $scope.grid.project = idx;
            var selectUsername = $scope.usernames[thisindex].login;
            var selectRepo = $scope.usernames[thisindex].repos[idx].name;
            $log.info("user and repos",selectUsername + selectRepo);
            Branch.get({users:selectUsername, repos:selectRepo},function(info) {
                $log.info("branch", info);
                $scope.branch = info.msg;
            });
        };
        $scope.selectBranch = function(idx) {
            $scope.grid.branch = idx;
        };
    }])

