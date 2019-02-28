'use strict';
angular.module('home.blank', [])
    .controller('blankCtrl', ['GLOBAL','sessiontoken','Cookie','$rootScope','User','Project','$log','$state','creatproject','$stateParams',
        function (GLOBAL,sessiontoken,Cookie,$rootScope,User,Project,$log,$state,creatproject,$stateParams) {
            //console.log('GLOBAL.sso_switch', GLOBAL.sso_switch);
            function loadProject(name, callback) {
                // $log.info("load project");
                Project.get({}, function (data) {
                    callback(name, data)
                    //console.log("load project success", data);

                }, function (res) {
                    $log.info("find project err", res);
                });
            };
            //console.log('GLOBAL.sso_switch', GLOBAL.sso_switchCookie.get('newState'));
            if (GLOBAL.sso_switch === 'true') {
                var oldurl = '';

                //console.log('$stateParams.oldurl', $stateParams);
                if ($stateParams.oldurl) {
                    oldurl = $stateParams.oldurl
                }else {
                    oldurl='console.build'
                }

                var data={
                    access_token:'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImNtLWNsdXN0ZXItYWRtaW4tdG9rZW4tdHFxYmwiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC5uYW1lIjoiY20tY2x1c3Rlci1hZG1pbiIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VydmljZS1hY2NvdW50LnVpZCI6IjUxMGMxNDBmLTcwNmEtMTFlOC1iNWYxLWZhMTYzZWYxMzRkZSIsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDpkZWZhdWx0OmNtLWNsdXN0ZXItYWRtaW4ifQ.PvAKpeLmCICQXNWYB-3-okkmEaQEGgroaBw0RTFKedPqPItnnXRRFgQ0CnNsWs3dcmR_BnMJg2o6wqQr-HkbKFQOo6rwtCpH9CWua6tfs6nlkv2rWovdjgUS-b8j_SnRnoXqDCovb5XMrAQwZ4C8qSBU-9WgLv8qyfdFEXcgefQYPTudlV1GDhz9fFKQThTB27vDjkTmvcxuMMyR3PPvvS4-1WvaC_pB1qadhpW3Nl_X35NCbuKElnLGzGisOjeuW_RxUa3-pgSGIe_3d7TEP0mRut7ls9TSTi7vxwSJuo3KfGGIqH3dH64XAlzM27HAUeBCesn8GiQq8OdqNhmbjw'
                }
                //sessiontoken.get(function (data) {
                    console.log('data.access_token', data.access_token);
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
                                $state.go('noproject', {namespace: $rootScope.namespace})
                                //creatproject.create({'metadata': {
                                //    name:$rootScope.user.metadata.name
                                //}}, function (res) {
                                //    loadProject($rootScope.user.metadata.name,function (name, data) {
                                //        for (var i = 0; i < data.items.length; i++) {
                                //            if (data.items[i].metadata.name == name) {
                                //                $rootScope.namespace = name;
                                //                angular.forEach(data.items, function (item, i) {
                                //
                                //                    data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;
                                //
                                //
                                //                })
                                //                data.items.sort(function (x, y) {
                                //                    return x.sortname > y.sortname ? 1 : -1;
                                //                });
                                //
                                //                $rootScope.projects = data.items;
                                //            }
                                //        }
                                //
                                //        $state.go(oldurl, {namespace: $rootScope.namespace})
                                //
                                //    })
                                //})
                            }
                        });


                    })

                //})

            }else {
                $state.go("login")
            }


        }]);
