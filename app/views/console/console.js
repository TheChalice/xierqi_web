'use strict';

angular.module('console', [
    {
        files:[
            'components/header/header.js',
            'components/sidebar/sidebar.js',
            'views/console/console.css'
        ]
    }
])
    .controller('ConsoleCtrl', ['$http','$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', 'Cookie', function ($http,$rootScope, $scope, $log, AUTH_EVENTS, User, user, Project, Cookie) {
        $log.info('Console');
        $rootScope.user = user;

        var namespace = Cookie.get('namespace');
        if (namespace) {
            $rootScope.namespace = namespace;
        } else {
            $rootScope.namespace = user.metadata.name;
            Cookie.set('namespace', name, 10 * 365 * 24 * 3600 * 1000);
        }

        var loadProject = function(){
            //$log.info("load project");
            Project.get(function(data){
                //$rootScope.projects = data.items;
                //var newprojects = []
                angular.forEach(data.items, function (project,i) {
                    if (/^[\u4e00-\u9fa5]+$/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                        console.log(project.metadata.annotations['openshift.io/display-name']);
                        data.items.push(project);
                        data.items.splice(i,1);
                    }
                });
                console.log(data.items);
                $rootScope.projects = data.items;


                $log.info("load project success", data);
            }, function(res){
                $log.info("find project err", res);
            });
        };

        loadProject();
    }]);

