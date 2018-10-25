'use strict';

angular.module('overview', [
    {
        files: [
            'components/header/header.js',
            'views/overview/overview.css'
        ]
    }
])
    .controller('overviewCtrl', ['GLOBAL','$scope', '$rootScope', 'Cookie', 'user', 'dclist', 'ServiceTenant', 'ToolTenant', 'AcessInformation','Sort',
        function (GLOBAL,$scope, $rootScope, Cookie, user, dclist, ServiceTenant, ToolTenant, AcessInformation,Sort) {
            if ($rootScope.user) {
                console.log('$rootScope.user', $rootScope.user.metadata.name);
            } else {
                $rootScope.user = user;
            }
            $scope.showAbout = true;
            $scope.urllist ={
                operation_url:GLOBAL.operation_url,
                dataassets_url:GLOBAL.dataassets_url,
                center_url:GLOBAL.center_url,
                application_url:GLOBAL.application_url,
                usercenter_url:GLOBAL.usercenter_url,
                smallbell_url:GLOBAL.smallbell_url,
            }
            var namespace = Cookie.get('namespace');
            var region = Cookie.get('region');
            var tenantId = Cookie.get('tenantId');

            if (region) {
                $rootScope.region = region;
            } else {
                console.log('noregion');
                $rootScope.region = 'cn-north-1';
                Cookie.set('region', $rootScope.region, 10 * 365 * 24 * 3600 * 1000);
            }

            if (namespace) {
                $rootScope.namespace = namespace;
            } else {
                //console.log('nonamespace');
                $rootScope.namespace = $rootScope.user.metadata.name;
                Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
            }
            // console.log('dclist', dclist);
            $scope.deploymentItem = dclist.items;
            $scope.deploymentItem = $scope.deploymentItem.slice(0, 5);
            $scope.deploymentItem = Sort.sort($scope.deploymentItem, -1)
            ServiceTenant.query({tenantId: Cookie.get('namespace')}, function (data) {
                console.log('ServiceTenant', data);
                $scope.ServiceTenant = data;
            }, function (res) {
                //todo 错误处理
            });
            ToolTenant.query({tenantId: Cookie.get('namespace')}, function (data) {
                console.log('ToolTenant', data);
            }, function (res) {
                //todo 错误处理
            });
            $scope.serviceTenantList = [
                {
                    "attributes": "{}",
                    "category": "service",
                    "cuzBsiName": "zhaoyim12345",
                    "id": "6c7dae3e-6edd-11e8-ac16-fa163e4dfe45",
                    "instanceName": "zhaoyim12345",
                    "quota": "{\"cuzBsiName\":\"zhaoyim12345\",\"instance_id\":\"6c7dae3e-6edd-11e8-ac16-fa163e4dfe45\",\"nameSpaceQuota\":\"1\",\"storageSpaceQuota\":\"1\"}",
                    "serviceId": "",
                    "serviceName": "HDFS",
                    "serviceType": "hdfs",
                    "status": "Unbound",
                    "tenantId": "000999"
                }, {
                    "attributes": "{}",
                    "category": "service",
                    "cuzBsiName": "zhaoyim12345",
                    "id": "6c7dae3e-6edd-11e8-ac16-fa163e4dfe45",
                    "instanceName": "zhaoyim12345",
                    "quota": "{\"cuzBsiName\":\"zhaoyim12345\",\"instance_id\":\"6c7dae3e-6edd-11e8-ac16-fa163e4dfe45\",\"nameSpaceQuota\":\"1\",\"storageSpaceQuota\":\"1\"}",
                    "serviceId": "",
                    "serviceName": "HDFS",
                    "serviceType": "hdfs",
                    "status": "Unbound",
                    "tenantId": "000999"
                }, {
                    "attributes": "{}",
                    "category": "service",
                    "cuzBsiName": "zhaoyim12345",
                    "id": "6c7dae3e-6edd-11e8-ac16-fa163e4dfe45",
                    "instanceName": "zhaoyim12345",
                    "quota": "{\"cuzBsiName\":\"zhaoyim12345\",\"instance_id\":\"6c7dae3e-6edd-11e8-ac16-fa163e4dfe45\",\"nameSpaceQuota\":\"1\",\"storageSpaceQuota\":\"1\"}",
                    "serviceId": "",
                    "serviceName": "HDFS",
                    "serviceType": "hdfs",
                    "status": "Unbound",
                    "tenantId": "000999"
                }, {
                    "attributes": "{}",
                    "category": "service",
                    "cuzBsiName": "zhaoyim12345",
                    "id": "6c7dae3e-6edd-11e8-ac16-fa163e4dfe45",
                    "instanceName": "zhaoyim12345",
                    "quota": "{\"cuzBsiName\":\"zhaoyim12345\",\"instance_id\":\"6c7dae3e-6edd-11e8-ac16-fa163e4dfe45\",\"nameSpaceQuota\":\"1\",\"storageSpaceQuota\":\"1\"}",
                    "serviceId": "",
                    "serviceName": "HDFS",
                    "serviceType": "hdfs",
                    "status": "Unbound",
                    "tenantId": "000999"
                }, {
                    "attributes": "{}",
                    "category": "service",
                    "cuzBsiName": "zhaoyim12345",
                    "id": "6c7dae3e-6edd-11e8-ac16-fa163e4dfe45",
                    "instanceName": "zhaoyim12345",
                    "quota": "{\"cuzBsiName\":\"zhaoyim12345\",\"instance_id\":\"6c7dae3e-6edd-11e8-ac16-fa163e4dfe45\",\"nameSpaceQuota\":\"1\",\"storageSpaceQuota\":\"1\"}",
                    "serviceId": "",
                    "serviceName": "HDFS",
                    "serviceType": "hdfs",
                    "status": "Unbound",
                    "tenantId": "000999"
                }
            ];
            $scope.toolTenantList = $scope.serviceTenantList;

            $scope.accessInfor = function (i) {

                console.log('$scope.toolTenantList[i].instanceName',$scope.toolTenantList[i].instanceName);

                AcessInformation.open($scope.toolTenantList[i].instanceName);

            }

        }]);

