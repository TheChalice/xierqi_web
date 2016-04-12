'use strict';
angular.module('console.service', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/service/service.css'
            ]
        }
    ])
.controller('ServiceCtrl', [ '$rootScope', '$scope', '$log', '$state', '$stateParams', 'Deploymentconfig','Replicationcontrollers', 'GLOBAL', 'Confirm', 'Sort', 'Ws', function ($rootScope, $scope, $log, $state, $stateParams, Deploymentconfig,Replicationcontrollers, GLOBAL, Confirm, Sort, Ws) {
    $log.info('ServiceCtrl======');
        //��ҳ
        $scope.grid = {
            page: 1,
            size: GLOBAL.size,
            txt: ''
        };

        $scope.$watch('grid.page', function(newVal, oldVal){
            if (newVal != oldVal) {
                refresh(newVal);
            }
        });

        var refresh = function(page) {
            var skip = (page - 1) * $scope.grid.size;
            $scope.items = $scope.data.items.slice(skip, skip + $scope.grid.size);
        };

        $scope.search = function (key, txt) {
            if (!txt) {
                refresh(1);
                return;
            }
            $scope.items = [];

            txt = txt.replace(/\//g, '\\/');
            var reg = eval('/' + txt + '/');

            angular.forEach($scope.data.items, function(item){
                if (key == 'all') {
                    if (reg.test(item.metadata.name) || reg.test(item.spec.source.git.uri) || (item.metadata.labels && reg.test(item.metadata.labels.build))) {
                        $scope.items.push(item);
                    }
                } else if (key == 'metadata.name') {
                    if (reg.test(item.metadata.name)) {
                        $scope.items.push(item);
                    }
                } else if (key == 'metadata.labels.build') {
                    if (item.metadata.labels && reg.test(item.metadata.labels.build)) {
                        $scope.items.push(item);
                    }
                } else if (key == 'spec.source.git.uri') {
                    if (reg.test(item.spec.source.git.uri)) {
                        $scope.items.push(item);
                    }
                }
            });
            $scope.grid.total = $scope.items.length;
        };
        var serviceList = function(){
            $log.info("serviceList ");
            Deploymentconfig.get({namespace: $rootScope.namespace}, function(data){
                $log.info('serviceList', data);
                data.items = Sort.sort(data.items, -1);
                $scope.data = data;
                $scope.grid.total = data.items.length;
                refresh(1);
                $log.info('$scope.data.items'+$scope.data.items)
                replicationcls($scope.data.items);
            }, function(res) {
                $log.info('serviceList', res);
                //todo ������
            });
        }
        serviceList();
        var replicationcls = function(items){
            $log.info(items)
            var labelSelector = '';
            if (items.length > 0) {
                labelSelector = 'buildconfig in (';
                for (var i = 0; i < items.length; i++) {
                    labelSelector += items[i].metadata.name + ','
                }
                labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
            }
            Replicationcontrollers.get({namespace: $rootScope.namespace,labelSelector: labelSelector}, function (data) {
                $log.info("Replicationcontrollers", data);

                $scope.resourceVersion = data.metadata.resourceVersion;
                    //watchBuilds(data.metadata.resourceVersion);
                    //
                    //fillBuildConfigs(data.items);
            });
        }
        //replicationcls();
}]);