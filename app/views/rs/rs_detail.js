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
    .controller('rsCtrl', ['$rootScope', '$scope', '$stateParams', 'Metrics', 'PieChar', 'mypod', '$interval', '$state', '$log','ReplicaSet',
        function ($rootScope, $scope, $stateParams, Metrics, PieChar, mypod, $interval, $state, $log, ReplicaSet) {
            // console.log($state.params.name);
            // console.log($stateParams.name);
            // $scope.dcName = $stateParams.name;
            var times = (new Date()).getTime();
            var netChart = function (activeDate, titleName) {
                return {
                    options: {
                        chart: {
                            type: 'areaspline'

                        },
                        title: {
                            text: name,
                            align: 'top',
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
                            enabled: false
                        }
                    },
                    series: [{
                        name: titleName,
                        fillColor: {
                            linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                            stops: [
                                [0, Highcharts.Color('#b3d4fc').setOpacity(0.5).get('rgba')],
                                [1, Highcharts.Color('#b3d4fc').setOpacity(0.8).get('rgba')]
                            ]
                        },
                        lineColor: '#fff',
                        fillOpacity: 0.6,
                        marker: {
                            enabled: false
                        },
                        data: activeDate,
                        pointStart: times + 3600 * 1000,
                        pointInterval: 15 * 60 * 1000 //时间间隔
                    }],
                    xAxis: {
                        // categories: ['12:00','14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
                        type: 'datetime',
                        gridLineWidth: 1
                    },
                    yAxis: [{
                        // gridLineDashStyle: 'ShortDash',
                        title: {
                            text: titleName,
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
            var filterForController = function(apiObjects, controller) {
                var controllerUID = _.get(controller, 'metadata.uid');
                return _.filter(apiObjects, function(apiObject) {
                    return _.some(getOwnerReferences(apiObject), {
                        uid: controllerUID,
                        controller: true
                    });
                });
            };
            var getPods = function(ReplicaSet){
                $scope.replicaPods = filterForController(mypod.items, ReplicaSet);
                console.log('mypod.items $scope.replicaPods',$scope.replicaPods);
            };

            angular.forEach(mypod.items, function (pod, i) {
                if (pod.metadata.name.indexOf($state.params.name) === 0) {
                    $scope.uid = pod.metadata.uid;
                    console.log($scope.uid);
                }
            });

            function loadrc(callback) {
                ReplicaSet.get({
                    namespace: $rootScope.namespace,
                    name: $state.params.name
                }, function (res) {
                    console.log('-----res---rsrs>>>', res);
                    // getPods(res);
                    // $scope.rc = angular.copy(res);
                    $scope.replicaSet = angular.copy(res);
                    $scope.environment = $scope.replicaSet.spec.template.spec.containers[0].env;
                    $scope.lables = $scope.replicaSet.metadata.labels.app;
                    $scope.containerName = $scope.replicaSet.spec.template.spec.containers[0].name;
                    callback($scope.lables);
                    getPods(res);
                });
            }

            loadrc(function (lables) {
                var networkobj = {
                    tags: 'descriptor_name:network/tx_rate|network/rx_rate,type:pod,pod_id:' + $scope.uid,
                    bucketDuration: "120000ms",
                    start: "-60mn"
                };
                var cpuandmemoryobj = {
                    tags: "descriptor_name:memory/usage|cpu/usage_rate,type:pod_container,pod_id:" + $scope.uid + ",container_name:" + $scope.containerName,
                    bucketDuration: "120000ms",
                    start: "-60mn"
                };
                getcpuandmemory(cpuandmemoryobj);
                getNetwork(networkobj);
            });

            var getcpuandmemory = function (cpuandmemoryobj) {
                PieChar.create(cpuandmemoryobj, function (data) {
                    // console.log('getcpuandmemory--->>>gauge', data.gauge);
                    var cpudata = [];
                    var memdata = [];
                    $scope.cpuData = [];
                    $scope.memData = [];
                    angular.forEach(data.gauge, function (item, i) {
                        var k = i.split('/')[i.split('/').length - 2];
                        if (k == 'cpu') {
                            cpudata = item;
                            angular.forEach(cpudata, function (input, i) {
                                if (!input.empty) {
                                    $scope.cpuData.push(Math.floor(input.avg / 1000 * 1000) / 1000);
                                } else {
                                    $scope.cpuData.push(0);
                                }
                            })

                        } else if (k == 'memory') {
                            memdata = item;
                            angular.forEach(memdata, function (input, i) {
                                if (!input.empty) {
                                    $scope.memData.push(Math.floor(input.avg / (1024 * 1024) * 100) / 100);
                                } else {
                                    $scope.memData.push(0);
                                }

                            });
                        }
                    });
                    $scope.CpuConfig = netChart($scope.cpuData, 'CPU/cores');
                    $scope.MemConfig = netChart($scope.memData, 'Memory/MiB');
                })
            };

            var getNetwork = function (networkobj) {
                PieChar.create(networkobj, function (data) {
                    // console.log('getNetwork--->>>gauge', data.gauge);
                    var networkrx = [];
                    var networktx = [];
                    $scope.nettxdata = [];
                    $scope.netrxdata = [];
                    angular.forEach(data.gauge, function (item, i) {
                        var k = i.split('/')[i.split('/').length - 1];
                        if (k == 'tx_rate') {
                            networkrx = item
                        } else if (k == 'rx_rate') {
                            networktx = item
                        }
                    });
                    angular.forEach(networkrx, function (input, i) {
                        if (!input.empty) {
                            $scope.netrxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                        } else {
                            $scope.netrxdata.push(0)
                        }
                    });
                    angular.forEach(networktx, function (input, i) {
                        if (!input.empty) {
                            $scope.nettxdata.push(Math.floor(input.avg / 1024 * 1000) / 1000)
                        } else {
                            $scope.nettxdata.push(0)
                        }
                    });
                    $scope.TxConfig = netChart($scope.nettxdata, 'Network (Sent)KB/s');
                    $scope.RxConfig = netChart($scope.netrxdata, 'Network (Received)KB/s');
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