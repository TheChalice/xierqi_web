'use strict';
angular.module('home.blank', [])
    .controller('blankCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject','$stateParams',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject,$stateParams) {
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
            //console.log('GLOBAL.sso_switch', GLOBAL.sso_switch);
            if (GLOBAL.sso_switch === 'true') {
                var oldurl = '';

                console.log('$stateParams.oldurl', $stateParams);
                if ($stateParams.oldurl) {
                    oldurl = $stateParams.oldurl
                }else {
                    oldurl='console.build'
                }


                sessiontoken.get(function (data) {
                    //console.log('data.access_token', data.access_token+','+data.access_token);
                    Cookie.set('df_access_token', data.access_token+','+data.access_token, 23 * 3600 * 1000);
                    Cookie.set('region', 'cn-north-1', 24 * 3600 * 1000);
                    $rootScope.region = Cookie.get('region');

                    User.get({name: '~'}, function (res) {
                        $rootScope.user = res;
                        $rootScope.namespace=$rootScope.user.metadata.name
                        Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                        var hasname = false;
                        Project.get({}, function (prodata) {
                            angular.forEach(prodata.items, function (item,i) {
                                item.sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name
                                if (item.metadata.name == $rootScope.user.metadata.name) {
                                    hasname = true
                                }
                            })
                            localStorage.setItem("code", 1);
                            $rootScope.projects = prodata.items;
                            if (hasname) {
                                $state.go(oldurl, {namespace: $rootScope.namespace})
                            }else if(prodata.items.length>0){
                                $rootScope.namespace=prodata.items[0].metadata.name
                                Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                                $state.go(oldurl, {namespace: $rootScope.namespace})
                            }else {
                                creatproject.create({'metadata': {
                                    name:$rootScope.user.metadata.name
                                }}, function (res) {
                                    loadProject($rootScope.user.metadata.name,function (name, data) {
                                        for (var i = 0; i < data.items.length; i++) {
                                            if (data.items[i].metadata.name == name) {
                                                $rootScope.namespace = name;
                                                angular.forEach(data.items, function (item, i) {

                                                    data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                                                })
                                                data.items.sort(function (x, y) {
                                                    return x.sortname > y.sortname ? 1 : -1;
                                                });

                                                $rootScope.projects = data.items;
                                            }
                                        }

                                        $state.go(oldurl, {namespace: $rootScope.namespace})

                                    })
                                })
                            }
                        });


                    })

                })

            }else {
                $state.go("login")
            }


        }]);
