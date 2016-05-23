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


        $scope.refresh = function() {
            Owner.query({namespace: $rootScope.namespace},function(res) {
                $log.info("owner", res);
                $scope.login = res.msg.infos;
                $scope.login.user = "user";
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
                $scope.orgName = data.msg;
                $scope.orgName.org = "org";
                $log.info("orgProject", $scope.orgName);
            });
        }
        $scope.refresh();

        $scope.selectUser = function(idx,chooseProject) {
            $scope.projectList = {
                reposobj : [],
                a : chooseProject
            };
            if(chooseProject == "user"){
                $scope.projectList.reposobj = $scope.login[idx].repos;
            }else if(chooseProject == "org"){
                $scope.projectList.reposobj = $scope.orgName[idx].repos;
            }
            $log.info('$scope.projectList.reposobj',$scope.projectList.reposobj);
        }

        $scope.selectBranch = function(idx,chooseProject) {
            alert(chooseProject)
            if(chooseProject == "org"){
                alert("a");
            }else if(chooseProject == "user"){
                alert("b");
            }
            //Branch.get({users:$scope.test11.reposobj[idx].name, repos:},function(info) {
            //    $log.info("branch", info)
            //});
        };
    }])

