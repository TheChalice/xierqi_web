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
        $rootScope.namespece = 'foundry';
        return;

        var loadProject = function(name){
            $log.info("load project");
            Project.get({name: name}, function(data){
                $log.info("load project success", data.metadata.name);
                $rootScope.namespece = data.metadata.name;
            }, function(res){
                $log.info("find project err", res);
                buildProject(name);
            });
        };

        loadProject($rootScope.namespece);

        var buildProject = function(name){
            $log.info("build project");
            var project = {
                metadata: {
                    name: name
                }
            };
            Project.create({}, project, function(data){
                $log.info("create project success", data.metadata.name);
                $rootScope.namespece = data.metadata.name;
            }, function(res){
                $log.info("build project err", res);
            });
        };

    }]);

