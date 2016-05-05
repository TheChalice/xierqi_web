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
    .controller('ConsoleCtrl', ['$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', 'Cookie', function ($rootScope, $scope, $log, AUTH_EVENTS, User, user, Project, Cookie) {
        $log.info('Console');
        $rootScope.user = user;

        var namespace = Cookie.get('namespace');
        if (namespace) {
            $rootScope.namespace = namespace;
        } else {
            $rootScope.namespace = user.metadata.name;
            Cookie.set('namespace', name, 10 * 365 * 24 * 3600 * 1000);
        }

        var loadProject = function(name){
            $log.info("load project");
            Project.get(function(data){
                $rootScope.projects = data.items;
                $log.info("load project success", data);
                buildProject(name);
            }, function(res){
                $log.info("find project err", res);
                buildProject(name);
            });
        };

        loadProject($rootScope.namespace);

        var buildProject = function(name){
            $log.info("build project");
            var project = {
                kind: 'ProjectRequest',
                apiVersion: 'v1',
                metadata: {
                    name: name
                }
            };
            Project.request.create({}, project, function(data){
                $log.info("create project success", data.metadata.name);
                $rootScope.namespace = data.metadata.name;
            }, function(res){
                $log.info("build project err", res);
            });
        };

    }]);

