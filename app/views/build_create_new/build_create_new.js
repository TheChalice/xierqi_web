'use strict';
angular.module('console.build_create_new', [
    {
        files: [
        ]
    }
])
    .controller ('BuildcCtrl', ['$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch','labOwner','psgitlab','laborgs','labBranch',function($rootScope, $scope, $state, $log, Owner, Org, Branch,labOwner,psgitlab,laborgs,labBranch) {

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
        $scope.psgitlab = {
            host : "",
            user : "",
            private_token : ""
        }
        $scope.labusername = [];
        $scope.labrepos = [];
        $scope.grid = {
            users: null,
            project: null,
            branch: null,
            labusers: null,
            labproject: null,
            labbranch: null,
            gitlabbox : false,
            labcon : false
        };
        var thisowner = {};
        $scope.loadlabOwner = function(){
            labOwner.get({},function(data) {
                $log.info("labOwner", data)
                for(var i = 0 ; i < data.msg.length;i++){
                    //$scope.labusername.push(data.msg[i]);
                    thisowner = data.msg[0];
                    for(var j = 0; j < data.msg[i].repos.length;j++){
                        data.msg[i].repos[j].objsname = data.msg[i].owner.name;
                    }
                }
                loadlaborgs();
                $scope.grid.labcon = true;
                $log.info(' $scope.grid0-0-0', $scope.grid)
            },function(data){
                $log.info("labOwner-------err",data);
                if(data.status == 400 && data.data.code == 1400){
                    $scope.grid.labcon = false;
                    $scope.grid.gitlabbox = true;
                }
            });
        }

        var loadlaborgs = function(){
            laborgs.get({},function(data) {
                $scope.labusername = [];
                $scope.labusername[0] = thisowner;
                $log.info("laborgs", data)
                for(var i = 0 ; i < data.msg.length;i++){
                    $scope.labusername.push(data.msg[i]);
                    for(var j = 0; j < data.msg[i].repos.length;j++){
                        data.msg[i].repos[j].objsname = data.msg[i].org.name;
                    }
                }
                $log.info("0-0-0-00-0-$scope.labusername",$scope.labusername);
            },function(data){
                $log.info("laborgs-------err",data)
            });
        }
        $scope.loadLabBranch = function(idx){
            var labId = $scope.labobjs[idx].id;
            labBranch.get({repo:labId},function(data){
                $scope.labBranchData = data;
                $scope.grid.labproject = idx;
                $log.info("loadLabBranch--=-=",data)
            },function(data){
                $log.info("loadLabBranch--=-=err",data)
            })
        }
        $scope.selectlabUser = function(idx) {
            $scope.labobjs = $scope.labusername[idx].repos;
            $scope.grid.labuser = idx;
            //$log.info('-0-0-0$scope.labobjs',$scope.labobjs);
        }
        $scope.selectlabBranch = function(idx){
            $scope.grid.labbranch = idx;
        }
        $scope.creatgitlab = function(){
            psgitlab.create({},$scope.psgitlab,function(res){
                $log.info('psgitlab-----0000',res);
                $scope.loadlabOwner();
                $scope.grid.labcon = true;
                $scope.grid.gitlabbox = false;
            },function(res){
                $log.info('psgitlab-----err',res);

            })
        }


    }])

