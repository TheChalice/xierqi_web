'use strict';
angular.module('home.blank', [])
    .controller('blankCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject) {
            console.log('GLOBAL.sso_switch', GLOBAL.sso_switch);
            function loadProject(name, callback) {
                // $log.info("load project");
                Project.get({}, function (data) {
                    callback(name, data)
                    //console.log("load project success", data);

                }, function (res) {
                    $log.info("find project err", res);
                });
            };
            if (GLOBAL.sso_switch === 'true') {

                sessiontoken.get(function (data) {
                    //console.log('data.access_token', data.access_token+','+data.access_token);
                    Cookie.set('df_access_token', data.access_token+','+data.access_token, 23 * 3600 * 1000);
                    Cookie.set('region', 'cn-north-1', 24 * 3600 * 1000);
                    $rootScope.region = Cookie.get('region');
                    User.get({name: '~'}, function (res) {
                        $rootScope.user = res;
                        creatproject.create({'metadata': {
                            name:$rootScope.user.metadata.name
                        }}, function (res) {
                            loadProject(res.metadata.name,function (name, data) {
                                for (var i = 0; i < data.items.length; i++) {
                                    if (data.items[i].metadata.name == name) {
                                        $rootScope.namespace = name;
                                        angular.forEach(data.items, function (item, i) {

                                            data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                                        })
                                        data.items.sort(function (x, y) {
                                            return x.sortname > y.sortname ? 1 : -1;
                                        });
                                        angular.forEach(data.items, function (project, i) {
                                            if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                                //console.log(project.metadata.annotations['openshift.io/display-name']);
                                                //data.items.push(project);
                                                data.items.unshift(project);

                                                data.items.splice(i + 1, 1);
                                            }
                                        });
                                        $rootScope.projects = data.items;
                                    }
                                }
                                localStorage.setItem("code", 1);
                                $rootScope.loginyanzheng = false;
                                //获取套餐

                                //$rootScope.loding = false;
                                $state.go("console.dashboard", {namespace: $rootScope.namespace})

                            })
                        }, function (err) {
                            loadProject(res.metadata.name,function (name, data) {
                                for (var i = 0; i < data.items.length; i++) {
                                    if (data.items[i].metadata.name == name) {
                                        $rootScope.namespace = name;
                                        angular.forEach(data.items, function (item, i) {

                                            data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                                        })
                                        data.items.sort(function (x, y) {
                                            return x.sortname > y.sortname ? 1 : -1;
                                        });
                                        angular.forEach(data.items, function (project, i) {
                                            if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                                //console.log(project.metadata.annotations['openshift.io/display-name']);
                                                //data.items.push(project);
                                                data.items.unshift(project);

                                                data.items.splice(i + 1, 1);
                                            }
                                        });
                                        $rootScope.projects = data.items;
                                    }
                                }
                                localStorage.setItem("code", 1);
                                $rootScope.loginyanzheng = false;
                                //获取套餐

                                //$rootScope.loding = false;
                                $state.go("console.dashboard", {namespace: $rootScope.namespace})

                            })
                        })

                    })

                })

            }else {
                $state.go("login")
            }


        }]);
