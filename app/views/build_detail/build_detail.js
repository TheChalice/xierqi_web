'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub','WebhookLabDel', 'WebhookHubDel','ImageStream', function (GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel,ImageStream) {
        $scope.grid = {};
        $scope.grid.checked = false;
        $scope.bcName = $stateParams.name;
        $scope.$on('image-enable', function(e, enable){
            $scope.imageEnable = enable;
        });

        var loadBuildConfig = function() {
            BuildConfig.get({namespace: $rootScope.namespace, name: $stateParams.name}, function(data){
                $log.info('data', data);
                //$log.info('labsecrect is',data.spec.source.sourceSecret.name);
                $scope.data = data;
                if (data.spec.source.git.uri.split(':')[0] == 'ssh') {
                    var host = data.spec.source.git.uri.replace('git@','').replace('.git','');

                    console.log(host.split('/'));

                    var parser = document.createElement('a');

                    parser.href = host;

                    parser.protocol='http:';

                    var post = parser.host.split(':')[0];
                    parser.host=post;
                    console.log(parser.href);
                    console.log(parser.hostname);
                    console.log(parser.pathname);
                    data.spec.source.git.uri='https://'+parser.hostname+parser.pathname
                }

                //var parser = document.createElement('a');
                //
                //parser.href = host;
                //
                //console.log(parser.protocol); // => "http:"
                //console.log(parser.hostname); // => "example.com"
                //console.log(parser.port);     // => "3000"
                //console.log(parser.pathname); // => "/pathname/"
                //console.log(parser.hash);     // => "#hash"
                //console.log(parser.host);     // => "example.com:3000"
                $log.info("printhost%%%%",host);

                if (data.spec && data.spec.completionDeadlineSeconds){
                    $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                }
                if (data.spec.triggers.length) {
                    //$scope.grid.checked = 'start';
                    //$scope.grid.checkedLocal = true;
                }
            }, function(res) {
                //错误处理
            });
        };

        loadBuildConfig();
        //开始构建
        $scope.startBuild = function() {
            var name = $scope.data.metadata.name;
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({namespace: $rootScope.namespace, name: name}, buildRequest, function(res){
                $log.info("build instantiate success");
                $scope.active = 1;  //打开记录标签
                $scope.$broadcast('timeline', 'add', res);
                createWebhook();
                //deleteWebhook();
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.delete = function(){
            var name = $scope.data.metadata.name;
            Confirm.open("删除构建", "您确定要删除构建吗?", "删除构建将清除构建的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function() {
                BuildConfig.remove({namespace: $rootScope.namespace, name: name}, {}, function(){
                    $log.info("remove buildConfig success");
                    removeIs($scope.data.metadata.name);
                    removeBuilds($scope.data.metadata.name);

                    $state.go("console.build");
                }, function(res){
                    //todo 错误处理
                });
            });
        };

        var removeBuilds = function (bcName) {
            if (!bcName) {
                return;
            }
            Build.remove({namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + bcName}, function(){
                $log.info("remove builds of " + bcName + " success");
            }, function(res){
                $log.info("remove builds of " + bcName + " error");
            });
        };
        var removeIs = function(name){
            ImageStream.delete({namespace: $rootScope.namespace,name:name},{},function(res){
                console.log("yes removeIs");
            },function(res){
                console.log("err removeIs");
            })
        }
        $scope.$watch('grid.checked', function(newVal, oldVal){
            if (newVal == "start") {
                return;
            }
            if (newVal != oldVal){
                $scope.saveTrigger();
            }
        });

        $scope.saveTrigger = function(){
            var name = $scope.data.metadata.name;
            if($scope.grid.checked){
                $scope.data.spec.triggers = [
                    {
                        type: 'GitHub',
                        github: {
                            secret: UUID.guid().replace(/-/g, "")
                        }
                    }
                ];
            } else {
                $scope.data.spec.triggers = [];
            }
            BuildConfig.put({namespace: $rootScope.namespace, name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.data = res;
                $scope.deadlineMinutesEnable = false;
                $scope.grid.checkedLocal = $scope.grid.checked;
                deleteWebhook();
                createWebhook();
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

        $scope.save = function(){
            if (!$scope.deadlineMinutesEnable) {
                $scope.deadlineMinutesEnable = true;
                return;
            }
            var name = $scope.data.metadata.name;
            $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
            BuildConfig.put({namespace: $rootScope.namespace, name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.data = res;
                $scope.deadlineMinutesEnable = false;
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

        var getSourceHost = function(href){
            var l = document.createElement("a");
            l.href = href;
            return l.hostname;
        };
        var getConfig = function(triggers){
            console.log(triggers)
            var str = "";
            for (var k in triggers){
                if (triggers[k].type == 'GitHub'){
                    str = GLOBAL.host_webhooks + '/namespaces/'+ $rootScope.namespace +'/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[k].github.secret + '/github'
                    return str;
                }
            }
        }

        var createWebhook = function(){
            var host = $scope.data.spec.source.git.uri;
            var triggers = $scope.data.spec.triggers;
            var config = getConfig(triggers);
            if ($scope.grid.checked) {
                if (getSourceHost(host)==='github.com') {
                    //$log.info("user is", $scope.data.metadata.annotations.user);
                    WebhookHub.check({
                        host: 'https://github.com',
                        namespace: $rootScope.namespace,
                        build: $stateParams.name,
                        user: $scope.data.metadata.annotations.user,
                        repo: $scope.data.metadata.annotations.repo,
                        spec: {events: ['push', 'pull_request', 'status'],config: {url:config}}
                    }, function (item) {

                    });
                } else {
                    WebhookLab.check({
                        host: 'https://code.dataos.io',
                        namespace: $rootScope.namespace,
                        build: $stateParams.name,
                        repo: $scope.data.metadata.annotations.repo,
                        spec: {url: config}
                    }, function (data) {
                        console.log("test repo", $scope.data.metadata.annotations.repo)
                    });
                }
            }
        };
        var deleteWebhook = function(){
            var host = $scope.data.spec.source.git.uri;
            if (!$scope.grid.checked) {
                if (getSourceHost(host)==='github.com'){
                    WebhookHubDel.del({
                        namespace: $rootScope.namespace,
                        build: $stateParams.name,
                        user: $scope.data.metadata.annotations.user,
                        repo: $scope.data.metadata.annotations.repo
                    },function(item1) {

                    })
                }else{
                    WebhookLabDel.del({
                        host: 'https://code.dataos.io',
                        namespace: $rootScope.namespace,
                        build: $stateParams.name,
                        repo: $scope.data.metadata.annotations.repo
                    }, function (data2) {
                    });
                }
            }
        }
    }]);

