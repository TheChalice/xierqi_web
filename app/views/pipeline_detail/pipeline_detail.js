'use strict';

angular.module('console.pipeline.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineDetailCtrl', [ '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'toastr','BuildConfigs','Project'
        , function ($rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, toastr,BuildConfigs,Project) {
            // $scope.BuildConfig = angular.copy(BuildConfigs);
            // $scope.nameset = $rootScope.namespace;

            Project.get({region: $rootScope.region}, function (data) {
                angular.forEach(data.items, function(item, i) {
                    if (item.metadata.name === $rootScope.namespace) {
                        $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                    }
                })
                $scope.BuildConfig = angular.copy(BuildConfigs);
            });

            

            $scope.getLog = function(idx){
                
              };

        }])
    ;

