(function() {
    'use strict';
    angular.module('console.import_from_file', [{
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
                'views/quick_deploy/quick_deploy.css'
            ]
        }])

        .controller('ImportFromFileCtrl', ['$scope', '$timeout', 'project', '$filter', '$rootScope'
            , function ($scope, $timeout, project, $filter, $rootScope) {
                var ctrl = this;
                var annotation = $filter('annotation');
                //var imageForIconClass = $filter('imageForIconClass');
                console.log('project', project)
                $scope.project = project;
                ctrl.$onInit = function() {
                    console.log('ctrl.$onInit')
                    ctrl.alerts = {};
                    ctrl.loginBaseUrl = 'https://new.dataos.io:8443'; //DataService.openshiftAPIBaseUrl();
                    // if on the landing page, show the project name in next-steps
                    // if (!$routeParams.project) {
                    ctrl.showProjectName = true;
                    // }
                    // $scope.$on('no-projects-cannot-create', function() {
                    //     console.log("$setValidity")
                    //         //ctrl.importForm.$setValidity('required', false);
                    //     $scope.importForm.$setValidity('required', false);
                    // });
                };

                function getIconClass() {
                    var icon = _.get(ctrl, 'template.metadata.annotations.iconClass', 'fa fa-clone');
                    return (icon.indexOf('icon-') !== -1) ? 'font-icon ' + icon : icon;
                }

                function getImage() {
                    var iconClass = _.get(ctrl, 'template.metadata.annotations.iconClass', 'fa fa-clone');
                    return imageForIconClass(iconClass);
                }

                ctrl.importFile = function() {
                    $scope.$broadcast('importFileFromYAMLOrJSON');
                };

                // ctrl.instantiateTemplate = function() {
                //     $scope.$broadcast('instantiateTemplate');
                // };

                $scope.$on('fileImportedFromYAMLOrJSON', function(event, message) {
                    console.log('message', message, 'message.templatesss', message.template)
                    ctrl.selectedProject = project //message.project;
                    ctrl.template = message.template;
                    // ctrl.iconClass = getIconClass();
                    // ctrl.image = getImage();
                    // ctrl.vendor = annotation(message.template, "openshift.io/provider-display-name");
                    // ctrl.docUrl = annotation(ctrl.template, "openshift.io/documentation-url");
                    // ctrl.supportUrl = annotation(ctrl.template, "openshift.io/support-url");
                    ctrl.actionLabel = "imported";
                    if (message.isList) {
                        ctrl.kind = null;
                        ctrl.name = "YAML / JSON";
                    } else if (message.resource) {
                        ctrl.kind = message.resource.kind;
                        ctrl.name = message.resource.metadata.name;
                    }
                    // Need to let the current digest loop finish so the template config step becomes visible or the wizard will throw an error
                    // from the change to currentStep
                    $timeout(function() {
                        ctrl.currentStep = ctrl.template ? "Template Configuration" : "Results";
                    }, 0);
                });

                $scope.$on('templateInstantiated', function(event, message) {
                    ctrl.selectedProject = project; //message.project;
                    ctrl.name = 'xx'; //$filter('displayName')(ctrl.template);
                    ctrl.actionLabel = null;
                    ctrl.kind = null;
                    ctrl.currentStep = "Results";
                });

                ctrl.close = function() {
                    ctrl.template = null;
                    var cb = ctrl.onDialogClosed();
                    if (_.isFunction(cb)) {
                        cb();
                    }
                    ctrl.wizardDone = false;
                    return true;
                };

                ctrl.stepChanged = function(step) {
                    if (step.stepId === 'results') {
                        ctrl.nextButtonTitle = "Close";
                        ctrl.wizardDone = true;
                    } else {
                        ctrl.nextButtonTitle = "Create";
                    }
                };

                ctrl.currentStep = "YAML / JSON";

                ctrl.nextCallback = function(step) {
                    if (step.stepId === 'file') {
                        ctrl.importFile();
                        return false; // don't actually navigate yet
                    } else if (step.stepId === 'template') {
                        ctrl.instantiateTemplate();
                        return false;
                    } else if (step.stepId === 'results') {
                        ctrl.close();
                        return false;
                    }
                    return true;
                };

            }]);

})();