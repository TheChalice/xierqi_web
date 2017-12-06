'use strict';
angular.module('console.build_create_new', [
        {
            files: [
                'views/build_create/build_create.css'
            ]
        }
    ])
    .controller('BuildCreateCtrl', ['repositorysecret', 'repositorybranches', 'repositorygit', 'authorize', 'createdeploy', 'randomWord', '$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch', 'labOwner', 'psgitlab', 'laborgs', 'labBranch', 'ImageStream', 'BuildConfig', 'Alert', '$http', 'Cookie', '$base64', 'secretskey',
        function (repositorysecret, repositorybranches, repositorygit, authorize, createdeploy, randomWord, $rootScope, $scope, $state, $log, Owner, Org, Branch, labOwner, psgitlab, laborgs, labBranch, ImageStream, BuildConfig, Alert, $http, Cookie, $base64, secretskey) {
            $scope.grid = {
                org: null,
                repo: null,
                branch: null
            }
            $scope.gitstatus = 'gitlab'
            $scope.buildConfig = {
                metadata: {
                    name: "",
                    annotations: {
                        'datafoundry.io/create-by': $rootScope.user.metadata.name,
                        repo: ''
                    },
                },
                spec: {
                    triggers: [
                        {
                            type: "GitHub",
                            github: {
                                secret: randomWord.word(false, 25)
                            }
                        }, {
                            type: "Generic",
                            generic: {
                                secret: randomWord.word(false, 20)
                            }
                        }
                    ],
                    source: {
                        type: 'Git',
                        git: {
                            uri: '',
                            ref: ''
                        },
                        contextDir: '/',
                        //sourceSecret: {
                        //    name: ''
                        //}
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
            $scope.gitdata = {
                orgs: [],
                repos: [],
                branchs: []
            }
            $scope.gitload = {
                github: [],
                gitlab: []
            }
            $scope.needbind = {
                github: false,
                gitlab: false
            }
            $scope.sername = {
                name: null,
                pwd: null
            }
            function clearselec() {
                for (var k in $scope.gitdata) {
                    $scope.gitdata[k] = []
                }
                for (var k in $scope.grid) {
                    $scope.grid[k] = null
                }
            }

            function loadgitdata(git, cache) {
                clearselec()
                var sendobj = {
                    source: git
                }
                if (cache) {
                    sendobj.cache = 'true'
                }
                repositorygit.query(sendobj, function (res) {
                    $scope.gitload[git] = res;
                    if (git === 'gitlab') {
                        $scope.gitdata.orgs = res;
                    } else if (!cache) {
                        $scope.gitdata.orgs = res;
                    }
                }, function (err) {
                    $scope.needbind[git] = true
                });
            }

            loadgitdata('github', 'cache')
            loadgitdata('gitlab', 'cache')
            $scope.bindhub = function (click) {
                authorize.get({source: click, redirect_url: encodeURIComponent(window.location.href)}, function (res) {
                }, function (err) {
                    if (err.data.code == 14003) {
                        window.location = err.data.message
                    }
                })
            };
            $scope.loadOwner = function (git) {
                loadgitdata(git)
            }

            $scope.$watch('check', function (n, o) {
                if (n === o) {
                    return
                }
                if (n) {
                    clearselec()
                    if (n === 1) {
                        $scope.gitstatus = 'gitlab'
                        $scope.gitdata.orgs = angular.copy($scope.gitload.gitlab)
                    } else if (n === 2) {
                        $scope.gitstatus = 'github'
                        $scope.gitdata.orgs = angular.copy($scope.gitload.github)
                    }
                }
            })
            $scope.selectorg = function (idx, orgs) {
                $scope.grid.org = idx;
                $scope.grid.repo = null;
                $scope.gitdata.branchs = [];
                $scope.gitdata.repos = angular.copy(orgs.repos)
                //console.log('$scope.gitdata.repos', $scope.gitdata.repos);
            }
            $scope.selectrepo = function (idx, repo) {
                $scope.grid.repo = idx;
                $scope.grid.branch = null;
                $scope.gitdata.branchs = [];
                if (!repo.branchs) {
                    var sendobj = {source: $scope.gitstatus, repo: repo.name, ns: repo.namespace};
                    if ($scope.gitstatus === 'gitlab') {
                        sendobj.id = repo.id;
                    }
                    repositorybranches.query(sendobj, function (branchres) {
                        repo.branchs = branchres
                        $scope.gitdata.branchs = angular.copy(repo.branchs)
                    })

                }
            }
            $scope.selectbranch = function (idx) {
                $scope.grid.branch = idx;
            }
            function createsecret(name, pwd) {
                $scope.secret = {
                    "kind": "Secret",
                    "apiVersion": "v1",
                    "metadata": {
                        "name": "custom-git-builder-" + $rootScope.user.metadata.name + '-' + $scope.buildConfig.metadata.name
                    },
                    "data": {},
                    "type": "Opaque"
                }
                if (name) {
                    $scope.secret.data.username = $base64.encode(name);
                }
                if (pwd) {
                    $scope.secret.data.username = $base64.encode(pwd);
                }

            }

            $scope.create = function () {

                var imageStream = {
                    metadata: {
                        annotations: {
                            'datafoundry.io/create-by': $rootScope.user.metadata.name,
                        },
                        name: $scope.buildConfig.metadata.name
                    }
                };
                ImageStream.create({namespace: $rootScope.namespace}, imageStream, function (res) {
                    console.log('res', res);
                })
                if ($scope.check !== 3) {

                    $scope.buildConfig.spec.source.git.ref = $scope.gitdata.branchs[$scope.grid.branch].name;
                    if ($scope.gitstatus === 'gitlab') {

                        $scope.buildConfig.spec.source.git.uri = $scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].ssh_clone_url;
                    }else {
                        
                        $scope.buildConfig.spec.source.git.uri = $scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].clone_url;
                    }

                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ":" + $scope.gitdata.branchs[$scope.grid.branch].name;
                    $scope.buildConfig.metadata.annotations.repo = $scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].name;
                    $scope.buildConfig.metadata.annotations.user = $scope.gitdata.orgs[$scope.grid.org].name;
                    //console.log('$scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo]', $scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].private);
                    if ($scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].private) {
                        //alert(1)
                        repositorysecret.get({source: $scope.gitstatus, ns: $rootScope.namespace}, function (resecret) {
                            $scope.buildConfig.spec.source.sourceSecret = {
                                name: resecret.secret
                            }
                            createBC()
                        })
                    } else {
                        createBC()
                    }

                } else {
                    $scope.buildConfig.spec.source.sourceSecret = {
                        name: ""
                    }

                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ':latest';
                    $scope.buildConfig.spec.triggers = [];
                    if (!$scope.sername.name && !$scope.sername.pwd) {
                        delete $scope.buildConfig.spec.source.sourceSecret;
                    } else {
                        createsecret($scope.sername.name, $scope.sername.pwd)
                    }
                    if ($scope.secret) {
                        secretskey.create({
                            namespace: $rootScope.namespace,
                            region: $rootScope.region
                        }, $scope.secret, function (item) {
                            $scope.buildConfig.spec.source.sourceSecret.name = $scope.secret.metadata.name;
                            createBC();
                        }, function (res) {
                            if (res.status == 409) {
                                $scope.buildConfig.spec.source.sourceSecret.name = $scope.secret.metadata.name;
                                createBC();
                            }
                        })
                    } else {
                        createBC();
                    }
                }


            }
            var createBC = function () {
                if ($scope.buildConfig.spec.source && $scope.buildConfig.spec.source.contextDir == '') {
                    delete $scope.buildConfig.spec.source.contextDir;
                }
                if ($scope.buildConfig.spec.source.git && $scope.buildConfig.spec.source.git.ref == '') {
                    delete $scope.buildConfig.spec.source.git.ref;
                }
                //$scope.buildConfig.region=$rootScope.region;
                BuildConfig.create({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region
                }, $scope.buildConfig, function (res) {
                    $log.info("buildConfig", res);
                    createBuild(res.metadata.name);
                    $scope.creating = false;
                }, function (res) {
                    $scope.creating = false;
                    if (res.data.code == 409) {
                        Alert.open('错误', "构建名称重复", true);
                    } else {
                        // Alert.open('错误', res.data.message, true);
                    }
                });
            }
            var createBuild = function (name) {
                var buildRequest = {
                    metadata: {
                        annotations: {
                            'datafoundry.io/create-by': $rootScope.user.metadata.name
                        },
                        name: name
                    }
                };

                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, buildRequest, function () {
                    $log.info("build instantiate success");
                    $state.go('console.build_detail', {name: name, from: 'create/new'})
                }, function (res) {
                    //console.log("uildConfig.instantiate.create",res);
                    //todo 错误处理
                });
            };
        }]);

