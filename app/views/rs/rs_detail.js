/**
 * Created by niuniu on 2018/1/5.
 */
'use strict';
angular.module('console.rs', [
    {
        files: [
            'views/rs/rs_detail.css',
            'components/deploymentsevent/deploymentsevent.js'
        ]
    }
])
    .controller('rsCtrl', ['$rootScope', '$scope', '$stateParams', 'Metrics', 'PieChar', 'myPodList', '$interval', '$state', '$log', 'ReplicaSet',
        function ($rootScope, $scope, $stateParams, Metrics, PieChar, myPodList, $interval, $state, $log, ReplicaSet) {
            // console.log($state.params.name);
            // console.log($stateParams.name);
            // $scope.dcName = $stateParams.name;
            $scope.times = (new Date()).getTime();
            var netChart = function (title, arr) {
                return {
                    options: {
                        chart: {
                            type: 'spline'

                        },
                        title: {
                            text: name,
                            align: 'left',
                            x: 0,
                            style: {
                                fontSize: '12px'
                            }
                        },
                        credits: {
                            enabled: false
                        },
                        tooltip: {
                            backgroundColor: '#666',
                            borderWidth: 0,
                            shadow: false,
                            style: {
                                color: '#fff'
                            }
                        },
                        legend: {
                            enabled: true
                        }
                    },
                    series: arr,
                    xAxis: {
                        // categories: ['12:00','14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
                        type: 'datetime',
                        gridLineWidth: 1
                    },
                    yAxis: [{
                        // gridLineDashStyle: 'ShortDash',
                        title: {
                            text: title,
                            style: {
                                color: '#bec0c7'
                            }
                        }

                    }],
                    size: {
                        height: 230,
                        width: 950
                    },
                    func: function (chart) {
                        //setup some logic for the chart
                    }
                };
            };
            var getOwnerReferences = function (apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };

            var filterForController = function (apiObjects, controller) {
                var controllerUID = _.get(controller, 'metadata.uid');
                return _.filter(apiObjects, function (apiObject) {
                    return _.some(getOwnerReferences(apiObject), {
                        uid: controllerUID,
                        controller: true
                    });
                });
            };


            ReplicaSet.get({namespace: $rootScope.namespace, name: $state.params.name}, function (res) {
                $scope.replicaSet = angular.copy(res);
                $scope.environment = $scope.replicaSet.spec.template.spec.containers[0].env;
                $scope.containerName = $scope.replicaSet.spec.template.spec.containers[0].name;
                console.log('$scope.containerName',$scope.containerName);
                $scope.replicaPods = filterForController(myPodList.items, res);
                console.log('$scope.replicaPods-=-=-=', $scope.replicaPods);
                var poduid = [];
                for (var i = 0; i < $scope.replicaPods.length; i++) {
                    poduid.push($scope.replicaPods[i].metadata.uid);
                }
                var newpoduid = poduid.join('|');
                var networkobj = {
                    tags: 'descriptor_name:network/tx_rate|network/rx_rate,type:pod,pod_id:' + newpoduid,
                    bucketDuration: "120000ms",
                    start: "-60mn"
                };
                var cpuandmemoryobj = {
                    tags: "descriptor_name:memory/usage|cpu/usage_rate,type:pod_container,pod_id:" + newpoduid + ",container_name:" + $scope.containerName,
                    bucketDuration: "120000ms",
                    start: "-60mn"
                };
                getNetwork(networkobj);
                getcpuandmemory(cpuandmemoryobj);
            });

            var getcpuandmemory = function (cpuandmemoryobj) {
                PieChar.create(cpuandmemoryobj, function (data) {
                    var CPUmetricsList = [];
                    var MEMmetricsList = [];
                    angular.forEach(data.gauge, function (item, i) {
                        var newcpuData = [];
                        var newmemData = [];
                        var cpudata = [];
                        var memdata = [];
                        var k = i.split('/')[i.split('/').length - 2];
                        var curPodUid = i.split('/')[i.split('/').length - 3];
                        var curPodName = '';
                        for (var i = 0; i < $scope.replicaPods.length; i++) {
                            if ($scope.replicaPods[i].metadata.uid == curPodUid) {
                                curPodName = $scope.replicaPods[i].metadata.name;
                            }
                        }
                        if (k == 'cpu') {
                            cpudata = item;
                            angular.forEach(cpudata, function (input, i) {
                                if (!input.empty) {
                                    newcpuData.push(Math.floor(input.avg / 1000 * 1000) / 1000);
                                } else {
                                    newcpuData.push(0);
                                }
                            });
                            var obj = {
                                name: curPodName,
                                fillColor: {
                                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                    stops: [
                                        [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                        [1, '#4ca7de']
                                    ]
                                },
                                // lineColor: '#4d5266',
                                fillOpacity: 0.6,
                                marker: {
                                    enabled: true
                                },
                                data: newcpuData,
                                pointStart: $scope.times + 3600 * 1000,
                                pointInterval: 15 * 60 * 1000 //时间间隔
                            };
                            CPUmetricsList.push(obj);

                        } else if (k == 'memory') {
                            memdata = item;
                            angular.forEach(memdata, function (input, i) {
                                if (!input.empty) {
                                    newmemData.push(Math.floor(input.avg / (1024 * 1024) * 100) / 100);
                                } else {
                                    newmemData.push(0);
                                }

                            });
                            var obj = {
                                name: curPodName,
                                fillColor: {
                                    linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                    stops: [
                                        [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                        [1, '#4ca7de']
                                    ]
                                },
                                // lineColor: '#4d5266',
                                fillOpacity: 0.6,
                                marker: {
                                    enabled: true
                                },
                                data: newmemData,
                                pointStart: $scope.times + 3600 * 1000,
                                pointInterval: 15 * 60 * 1000 //时间间隔
                            };
                            MEMmetricsList.push(obj);
                        }
                    });
                    $scope.CpuConfig = netChart('CPU/cores', CPUmetricsList);
                    $scope.MemConfig = netChart('Memory/MiB', MEMmetricsList);
                })
            };

            var getNetwork = function (networkobj) {
                PieChar.create(networkobj, function (data) {
                    var TXmetricsList = [];
                    var RXmetricsList = [];
                    angular.forEach(data.gauge, function (item, i) {
                        var testobj = {
                            name: '',
                            fillColor: {
                                linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                stops: [
                                    [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                                    [1, '#4ca7de']
                                ]
                            },
                            // lineColor: '#4d5266',
                            fillOpacity: 0.6,
                            marker: {
                                enabled: true
                            },
                            data: '',
                            pointStart: $scope.times + 3600 * 1000,
                            pointInterval: 15 * 60 * 1000 //时间间隔
                        }
                        var networkrx = [];
                        var networktx = [];
                        var newnettxdata = [];
                        var newnetrxdata = [];
                        var k = i.split('/')[i.split('/').length - 1];
                        var curPodUid = i.split('/')[i.split('/').length - 3];
                        var curPodName = '';
                        for (var i = 0; i < $scope.replicaPods.length; i++) {
                            if ($scope.replicaPods[i].metadata.uid == curPodUid) {
                                curPodName = $scope.replicaPods[i].metadata.name;
                            }
                        }
                        if (k == 'tx_rate') {
                            networkrx = item;
                            angular.forEach(networkrx, function (input, i) {
                                if (!input.empty) {
                                    newnetrxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                                } else {
                                    newnetrxdata.push(0)
                                }
                            });
                            testobj.name = curPodName;
                            testobj.data = newnetrxdata;
                            TXmetricsList.push(testobj);
                        } else if (k == 'rx_rate') {
                            networktx = item;
                            angular.forEach(networktx, function (input, i) {
                                if (!input.empty) {
                                    newnettxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                                } else {
                                    newnettxdata.push(0)
                                }
                            });
                            testobj.name = curPodName;
                            testobj.data = newnettxdata;
                            RXmetricsList.push(testobj);
                        }
                    });
                    $scope.TxConfig = netChart('Network (Sent)KB/s', TXmetricsList);
                    $scope.RxConfig = netChart('Network (Received)KB/s', RXmetricsList);
                })
            };
            var timer = $interval(function () {
                getNetwork()
            }, 60000);
            $scope.$on("$destroy",
                function () {
                    $interval.cancel(timer);
                }
            );
        }]);