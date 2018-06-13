'use strict';
angular.module('console.build_create', [
    {
        files: [
            'views/build_create/build_create.css'
        ]
    }
])
    .controller('BuildCreateCtrl', ['repositorysecret', 'repositorybranches', 'repositorygit', 'authorize', 'createdeploy', 'randomWord', '$rootScope', '$scope', '$state', '$log', 'Owner', 'Org', 'Branch', 'labOwner', 'psgitlab', 'laborgs', 'labBranch', 'ImageStream', 'BuildConfig', 'Alert', '$http', 'Cookie', '$base64', 'secretskey', 'toastr',
        function (repositorysecret, repositorybranches, repositorygit, authorize, createdeploy, randomWord, $rootScope, $scope, $state, $log, Owner, Org, Branch, labOwner, psgitlab, laborgs, labBranch, ImageStream, BuildConfig, Alert, $http, Cookie, $base64, secretskey, toastr) {
            $scope.grid = {
                org: null,
                repo: null,
                branch: null
            };
            $scope.selectCodeBase = {
                status: 1
            };
            $scope.gitstatus = 'gitlab';
            var urlRegExp = /[a-zA-z]+:\/\/[^\s]*/;//url
            var nameRegExp = /^[A-Za-z]+$/;//由26个英文字母组成的字符串
            var pwdRegExp = /^[A-Za-z0-9]{6,20}$/;//密码(以字母开头，长度在6~18之间，只能包含字母、数字和下划线)
            var r = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;

            $scope.buildConfig = {
                metadata: {
                    name: "",
                    annotations: {
                        'datafoundry.io/create-by': $rootScope.user.metadata.name,
                        repo: ''
                    }
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
                    runPolicy: "Parallel",
                    source: {
                        type: 'Git',
                        git: {
                            uri: '',
                            ref: ''
                        },
                        contextDir: '/'
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
            $scope.namerr = {
                nil: false,
                rexed: false,
                repeated: false,
                urlerr: false
            };
            $scope.gitdata = {
                orgs: [],
                repos: [],
                branchs: []
            };
            $scope.gitload = {
                github: [],
                gitlab: []
            };
            $scope.needbind = {
                github: false,
                gitlab: false
            };
            $scope.sername = {
                name: null,
                pwd: null
            };
            function clearselec() {
                for (var k in $scope.gitdata) {
                    $scope.gitdata[k] = []
                }
                for (var k in $scope.grid) {
                    $scope.grid[k] = null
                }
            }

            function loadgitdata(git, cache) {
                clearselec();
                var sendobj = {
                    source: git
                };
                if (cache) {
                    sendobj.cache = 'true'
                }
                repositorygit.query(sendobj, function (res) {
                    $scope.gitload[git] = res;
                    if (git === 'gitlab') {
                        $scope.gitdata.orgs = res;
                        $scope.showbox = true
                    } else {
                        $scope.gitdata.orgs = res;
                    }
                }, function (err) {
                    $scope.needbind[git] = true
                });
            }

            $scope.$watch('grid', function (n, o) {
                console.log('grif', n);
            }, true);
            loadgitdata('github', 'cache');
            loadgitdata('gitlab', 'cache');
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
            };
            var one = true;
            $scope.$watch('buildcheck', function (n, o) {
                // console.log('---', n, o);
                $scope.showbox = false;
                if (n === o) {
                    return
                }
                if (n) {
                    $scope.gitStatus = {
                        organization: false,
                        project: false,
                        codeBranch: false
                    };
                    clearselec();
                    if (n === 1) {
                        $scope.gitstatus = 'gitlab';
                        $scope.gitdata.orgs = angular.copy($scope.gitload.gitlab);
                        //console.log('$scope.needbind.gitlab', $scope.needbind.gitlab);
                        if (one) {
                            one = false
                        } else {
                            if (!$scope.needbind.gitlab) {
                                $scope.showbox = true
                            }
                        }


                    } else if (n === 2) {
                        $scope.gitstatus = 'github';
                        $scope.gitdata.orgs = angular.copy($scope.gitload.github);
                        if (!$scope.needbind.github) {
                            $scope.showbox = true
                        }
                    }
                }
            });
            $scope.selectorg = function (idx, orgs) {
                // console.log('$scope.selectorg', idx, orgs);
                $scope.grid.org = idx;
                $scope.grid.repo = null;
                $scope.gitdata.branchs = [];
                $scope.gitdata.repos = angular.copy(orgs.repos);
            };
            $scope.selectrepo = function (idx, repo) {
                // console.log('$scope.selectrepo', idx, repo);
                $scope.grid.repo = idx;
                $scope.grid.branch = null;
                $scope.gitdata.branchs = [];
                if (!repo.branchs) {
                    var sendobj = {source: $scope.gitstatus, repo: repo.name, ns: repo.namespace};
                    if ($scope.gitstatus === 'gitlab') {
                        sendobj.id = repo.id;
                    }
                    repositorybranches.query(sendobj, function (branchres) {
                        repo.branchs = branchres;
                        $scope.gitdata.branchs = angular.copy(repo.branchs)
                    })

                }
            };
            $scope.selectbranch = function (idx) {
                $scope.grid.branch = idx;
            };

            function createsecret(name, pwd) {
                $scope.secret = {
                    "kind": "Secret",
                    "apiVersion": "v1",
                    "metadata": {
                        "name": "custom-git-builder-" + $rootScope.user.metadata.name + '-' + $scope.buildConfig.metadata.name
                    },
                    "data": {},
                    "type": "Opaque"
                };
                if (name) {
                    $scope.secret.data.username = $base64.encode(name);
                }
                if (pwd) {
                    $scope.secret.data.username = $base64.encode(pwd);
                }
            }

            $scope.create = function () {
                $scope.namerr = {
                    nil: false,
                    rexed: false,
                    repeated: false,
                    urlerr: false
                };
                $scope.privateErr = {
                    urlerr: false,
                    usernameerr: false,
                    pwderr: false
                };
                $scope.publicErr = {
                    urlerror: false
                };
                $scope.gitStatus = {
                    organization: false,
                    project: false,
                    codeBranch: false
                };
                //校验构建名称
                BuildConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    // console.log('data.items11111111', data.items);
                    $scope.data = [];
                    angular.forEach(data.items, function (item, i) {
                        if (item.spec.strategy.type !== "JenkinsPipeline" && item.spec.source.type !== "Binary") {
                            $scope.data.push(item)
                        }
                    });
                    // console.log('data.items--$scope.data-----', $scope.data);
                    $scope.buildList = $scope.data;
                    for (var i = 0; i < $scope.buildList.length; i++) {
                        if ($scope.buildConfig.metadata.name === $scope.buildList[i].metadata.name) {
                            $scope.namerr.repeated = true;
                            return
                        }
                    }
                }, function (res) {
                    //todo 错误处理
                });

                if (!$scope.buildConfig.metadata.name) {
                    $scope.namerr.nil = true;
                    return
                } else if (!r.test($scope.buildConfig.metadata.name)) {
                    $scope.namerr.rexed = true;
                    return
                }
                var imageStream = {
                    metadata: {
                        annotations: {
                            'datafoundry.io/create-by': $rootScope.user.metadata.name
                        },
                        name: $scope.buildConfig.metadata.name
                    }
                };
                ImageStream.create({namespace: $rootScope.namespace}, imageStream, function (res) {
                    // console.log('res', res);
                });
                if ($scope.buildcheck !== 3) {
                    //$scope.buildConfig.metadata.annotations.user=$scope.buildConfig.metadata.name
                    //console.log('$scope.grid.org', $scope.grid);
                    if ($scope.grid.org == null) {
                        $scope.gitStatus.organization = true;
                        return;
                    }
                    // console.log('$scope.grid.repo', $scope.grid.repo);
                    if ($scope.grid.repo == null) {
                        $scope.gitStatus.project = true;
                        return;
                    }
                    // console.log('$scope.grid.branch', $scope.grid.branch);
                    if ($scope.grid.branch == null) {
                        $scope.gitStatus.codeBranch = true;
                        return;
                    }
                    $scope.buildConfig.spec.source.git.ref = $scope.gitdata.branchs[$scope.grid.branch].name;
                    if ($scope.gitstatus === 'gitlab') {

                        $scope.buildConfig.spec.source.git.uri = $scope.gitload.gitlab[$scope.grid.org].repos[$scope.grid.repo].ssh_clone_url;

                        $scope.buildConfig.metadata.annotations.user = $scope.gitload.gitlab[$scope.grid.org].namespace;
                        $scope.buildConfig.metadata.annotations.repo = $scope.gitload.gitlab[$scope.grid.org].repos[$scope.grid.repo].name;
                        $scope.buildConfig.metadata.annotations.id = $scope.gitload.gitlab[$scope.grid.org].repos[$scope.grid.repo].id.toString();
                    } else {
                        //console.log('$scope.gitdata.orgs[$scope.grid.org].name', );
                        $scope.buildConfig.spec.source.git.uri = $scope.gitload.github[$scope.grid.org].repos[$scope.grid.repo].clone_url;
                        $scope.buildConfig.metadata.annotations.user = $scope.gitload.github[$scope.grid.org].namespace;
                        $scope.buildConfig.metadata.annotations.repo = $scope.gitload.github[$scope.grid.org].repos[$scope.grid.repo].name;
                    }
                    var name = '';
                    if ($scope.gitdata.branchs[$scope.grid.branch].name) {
                        name = $scope.gitdata.branchs[$scope.grid.branch].name.replace('/', '-');
                    }

                    $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ":" + name;
                    //console.log('$scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo]', $scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].private);
                    if ($scope.gitdata.orgs[$scope.grid.org].repos[$scope.grid.repo].private) {
                        repositorysecret.get({source: $scope.gitstatus, ns: $rootScope.namespace}, function (resecret) {
                            $scope.buildConfig.spec.source.sourceSecret = {
                                name: resecret.secret
                            };
                            createBC()
                        })
                    } else {
                        createBC()
                    }

                } else {
                    // if (!$scope.buildConfig.spec.source.git.uri) {
                    //     $scope.namerr.urlerr = true;
                    //     return
                    // }
                    if ($scope.selectCodeBase.status == 1) {
                        // console.log('$scope.selectCodeBase.status==1');
                        //校验公有代码库仓库地址、用户名、口令
                        if (urlRegExp.test($scope.buildConfig.spec.source.git.publicurl) === false) {
                            $scope.publicErr.urlerror = true;
                            return;
                        }
                        $scope.buildConfig.spec.source.git.uri = $scope.buildConfig.spec.source.git.publicurl;
                        createBuildModel();
                    } else if ($scope.selectCodeBase.status == 2) {
                        // console.log('$scope.selectCodeBase.status==2');
                        //校验私有代码库仓库地址、用户名、口令
                        if (urlRegExp.test($scope.buildConfig.spec.source.git.uri) === false) {
                            $scope.privateErr.urlerr = true;
                            return;
                        }
                        if (nameRegExp.test($scope.sername.name) === false) {
                            $scope.privateErr.usernameerr = true;
                            return;
                        }
                        if (!$scope.sername.name) {
                            $scope.privateErr.usernameerr = true;
                            return;
                        }
                        if (pwdRegExp.test($scope.sername.pwd) === false) {
                            $scope.privateErr.pwderr = true;
                            return;
                        }
                        createBuildModel();
                    }
                }
            };
            var createBuildModel = function () {
                $scope.buildConfig.spec.source.sourceSecret = {
                    name: ""
                };
                $scope.buildConfig.spec.output.to.name = $scope.buildConfig.metadata.name + ':latest';
                //$scope.buildConfig.spec.triggers = [];
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
                        //alert(1);
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
            };
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
                    // console.log("buildConfig", res);
                    toastr.success('操作成功', {
                        timeOut: 2000,
                        closeButton: true
                    });
                    createBuild(res.metadata.name);
                    $scope.creating = false;
                }, function (res) {
                    toastr.error('操作失败,请重试', {
                        timeOut: 2000,
                        closeButton: true
                    });
                    $scope.creating = false;
                    if (res.data.code == 409) {
                        $scope.namerr.repeated = true
                    } else {
                        // Alert.open('错误', res.data.message, true);
                    }
                });
            };
            var createBuild = function (name) {
                // console.log('createBuild-------',name);
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
                    $state.go('console.build_detail', {namespace: $rootScope.namespace, name: name, from: 'create/new'})
                }, function (res) {
                    //console.log("uildConfig.instantiate.create",res);
                    //todo 错误处理
                });
            };
        }]);

