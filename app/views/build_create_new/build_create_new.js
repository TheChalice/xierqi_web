'use strict';
angular.module('console.build_create_new', [
    {
        files: [
        ]
    }
])
    .controller ('BuildcCtrl', ['$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch',function($rootScope, $scope, $state, $log, Owner, Org, Branch) {

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
        };

        $scope.usernames = [];
        $scope.objnames = [];

        $scope.refresh = function() {
            Owner.query({namespace: $rootScope.namespace},function(res) {
                $log.info("owner", res);
                $scope.login = res.msg.infos;
                for(var i = 0 ; i < res.msg.infos.length;i++){
                    $scope.usernames.push(res.msg.infos[i]);
                    for(var j = 0; j < res.msg.infos[i].repos.length;j++){
                        res.msg.infos[i].repos[j].test11 = res.msg.infos[i].login;
                    }
                }

                $log.info("userProject", $scope.login);
            },function(data){
                $log.info('-=-=-=-=',data);
                if (data.status == 401) {
                    if (data.data.code == 1401){
                        //goto github
                    }
                    //$log.info(data.data.code);
                }
            });
            Org.get(function(data) {
                $log.info("org", data);
                for(var i = 0 ; i < data.msg.length;i++){
                    $scope.usernames.push(data.msg[i]);
                    for(var j = 0; j < data.msg[i].repos.length;j++){
                        data.msg[i].repos[j].test11 = data.msg[i].login;
                    }
                }
                $log.info("orgProject", $scope.orgName);
            });
        }

        $scope.refresh();

        $scope.selectUser = function(idx) {
            $scope.reposobj = $scope.usernames[idx].repos;
            thisindex = idx;
            $log.info('$scope.projectList.reposobj',$scope.reposobj);
        }

        $scope.selectBranch = function(idx) {
            var selectUsername = $scope.usernames[thisindex].login;
            var selectRepo = $scope.usernames[thisindex].repos[idx].name;
            $log.info("user and repos",selectUsername + selectRepo)
            Branch.get({users:selectUsername, repos:selectRepo},function(info) {
                $log.info("branch", info)
            });
        };
    }])

