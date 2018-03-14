'use strict';

angular.module('console.pipeline.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineDetailCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'toastr', 'BuildConfigs', 'Project'
        , function ($rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, toastr, BuildConfigs, Project) {
            // $scope.BuildConfig = angular.copy(BuildConfigs);
            // $scope.nameset = $rootScope.namespace;

            Project.get({ region: $rootScope.region }, function (data) {
                angular.forEach(data.items, function (item, i) {
                    if (item.metadata.name === $rootScope.namespace) {
                        $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                    }
                })
                $scope.BuildConfig = angular.copy(BuildConfigs);
            });

            $scope.gcopy=function(){ 
                copyblock(event)
            }
           //复制方法
            var copyblock = function (event) {
                var e = event.target.previousElementSibling;
                var textInput = document.createElement('input');
                textInput.setAttribute('value', e.textContent)
                //textInput.style.cssText = "position: absolute; top:0; left: -9999px";
                document.body.appendChild(textInput);
                textInput.select();
                var success = document.execCommand('copy');
                if (success) { 
                    if(event.target.innerText=="复制"){
                        event.target.innerText='已复制'
                    }
                   
                }
            }
            


            $scope.getLog = function (idx) {

            };

        }])
    ;

