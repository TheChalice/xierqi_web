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
    .controller('ConsoleCtrl', ['$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', function ($rootScope, $scope, $log, AUTH_EVENTS, User, user, Project) {
        $log.info('Console');
        $rootScope.user = user;
        $rootScope.namespace = user.metadata.name;

        var loadProject = function(name){
            $log.info("load project");
            Project.get(function(data){
                $log.info("load project success", data);
                for(var i = 0; i < data.items.length; i++) {
                    if(data.items[i].metadata.name == name){
                        $rootScope.namespace = name;
                        return;
                    }
                }
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

