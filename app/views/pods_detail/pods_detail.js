'use strict';
angular.module('console.pods_detail', [
        {
            files: [
                'views/pods_detail/pods_detail.css',
                'components/deploymentsevent/deploymentsevent.js'
            ]
        }
    ])
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'podDetails','mypod',
        function ($rootScope, $scope, $state, $log,podDetails,mypod) {
            $scope.pod=angular.copy(mypod)
            if (podDetails) {
               //Environment模块
                $scope.Pod = angular.copy(podDetails);
                $scope.environment = $scope.Pod.spec.containers[0].env;




            }

          //memory模块设置
          var times = (new Date()).getTime();
          var setChart = function () {
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
                        enabled: false
                    }
                },
                series: [{
                    name: 'cpu',
                    fillColor: {
                        linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                        stops: [
                            [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                            [1, '#4ca7de']
                        ]
                    },
                    lineColor: '#000', //线的颜色
                    lineWidth: 0.5,  //线的粗细
                    fillOpacity: 0.6,
                    marker: {   //数据节点显示 
                        enabled: true
                    },
                    yAxis: 1,
                    data:[100,200,300,400],
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
                        text: '',
                    }

                }, {
                    // gridLineDashStyle: 'ShortDash',
                    title: {
                        text: 'CPU (%)',
                        style: {
                            color: '#f6a540'
                        }
                    },
                    opposite: false
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

          $scope.chartmConfig = setChart();//memory模块设置



           //CPU模块设置
           var times = (new Date()).getTime();
           var setChart = function () {
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
                         enabled: false
                     }
                 },
                 series: [{
                     name: 'cpu',
                     fillColor: {
                         linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                         stops: [
                             [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                             [1, '#4ca7de']
                         ]
                     },
                     lineColor: '#000', //线的颜色
                     lineWidth: 0.5,  //线的粗细
                     fillOpacity: 0.6,
                     marker: {   //数据节点显示 
                         enabled: true
                     },
                     yAxis: 1,
                     data:[100,200,300,400],
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
                         text: '',
                     }
 
                 }, {
                     // gridLineDashStyle: 'ShortDash',
                     title: {
                         text: 'CPU (%)',
                         style: {
                             color: '#f6a540'
                         }
                     },
                     opposite: false
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
 
           $scope.chartcConfig = setChart();//CPU模块设置


           //Network模块设置
           var times = (new Date()).getTime();
           var setChart = function () {
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
                series: [{
                    name: 'cpu',
                    fillColor: {
                        linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                        stops: [
                            [0, Highcharts.Color('#fff').setOpacity(0.8).get('rgba')],
                            [1, '#4ca7de']
                        ]
                    },
                    lineColor: '#f00',
                    fillOpacity: 0.6,
                    marker: {
                        enabled: true
                    },
                    yAxis: 1,
                    data:[10,30,90,30],
                    pointStart: times + 3600 * 1000,
                    pointInterval: 15 * 60 * 1000 //时间间隔
                },
                    {
                        name: '内存',
                        fillColor: {
                            linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                            stops: [
                                [0, Highcharts.Color('#36a390').setOpacity(0.8).get('rgba')],
                                [1, '#79d87e']
                            ]
                        },
                        lineColor: '#000',
                        fillOpacity: 0.6,
                        marker: {
                            enabled: true
                        },
                        yAxis: 0,
                        data: [10,30,20,80],
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
                        text: 'memory (M)',
                        style: {
                            color: '#bec0c7'
                        }
                    }

                }, {
                    // gridLineDashStyle: 'ShortDash',
                    title: {
                        text: 'CPU (%)',
                        style: {
                            color: '#f6a540'
                        }
                    },
                    opposite: true
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
 
           $scope.chartnConfig = setChart();//Network模块设置

            
            
        }])
    .directive('podLogs', function () {
        return {
            restrict: 'EA',
            templateUrl: 'views/pods_detail/tpl/logs.html',
            scope: {
                podName : '@podName',
                podContainerName : '@podContainerName',
                podResourceVersion : '@podResourceVersion'
            },
            controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', '$base64','ansi_ups','$sce','$log',
                function ($scope, ReplicationController, $rootScope, Ws, $base64,ansi_ups,$sce,$log) {
                    console.log($scope.podResourceVersion,$scope.podContainerName);
                    var watchpod = function (resourceVersion, conname,name) {
                        Ws.watch({
                            api: 'k8s',
                            resourceVersion: resourceVersion,
                            namespace: $rootScope.namespace,
                            type: 'pods',
                            name: name + '/log',
                            pod: conname,
                            protocols: 'base64.binary.k8s.io'
                        }, function (res) {

                            if (res.data && typeof res.data == "string") {
                                $scope.result += $base64.decode(res.data);
                                var html = ansi_ups.ansi_to_html($scope.result);
                                $scope.log = $sce.trustAsHtml(html);
                                //console.log('$scope.log ', html);
                                $scope.$apply();

                            }

                            //loglast()
                        }, function () {
                            $log.info("webSocket startRC");
                        }, function () {
                            $log.info("webSocket stopRC");
                            var key = Ws.key($rootScope.namespace, 'pods', $scope.pod);
                            if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                                return;
                            }
                            //watchpod($scope.resourceVersion);
                        });
                    };
                    watchpod($scope.podResourceVersion,$scope.podContainerName,$scope.podName)
                }],
        };
    })
    .service('ContainerModal', ['$uibModal', function ($uibModal) {
        this.open = function (pod, obj) {
            return $uibModal.open({
                backdrop: 'static',
                templateUrl: 'views/service_detail/containerModal.html',
                size: 'default modal-lg',
                controller: ['$base64', '$sce', 'ansi_ups', '$rootScope', '$scope', '$log', '$uibModalInstance', 'ImageStream', 'Pod', 'Ws', 'Metrics', 'MetricsService',
                    function ($base64, $sce, ansi_ups, $rootScope, $scope, $log, $uibModalInstance, ImageStream, Pod, Ws, Metrics, MetricsService) {
                        $scope.pod = pod;
                        //console.log("pod-=-=-=-=-!!!!", pod);
                        $scope.grid = {
                            show: false,
                            mem: false,
                            cpu: false
                        };
                        var loglast = function () {
                            setTimeout(function () {
                                $('#sc').scrollTop(1000000);

                            }, 200)
                        }
                        $scope.ok = function () {
                            $uibModalInstance.close(true);
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };

                        var imageStreamName = function (image) {
                            if (!image) {
                                return "";
                            }
                            var match = image.match(/\/([^/]*)@sha256/);
                            if (!match) {
                                return image.split(":");
                            }
                            return match[1];
                        };

                        var preparePod = function (pod) {
                            var status = pod.status.containerStatuses;
                            var statusMap = {};
                            for (var i = 0; i < status.length; i++) {
                                statusMap[status[i].name] = status[i];
                            }

                            var containers = pod.spec.containers;

                            angular.forEach(pod.spec.containers, function (container) {
                                if (statusMap[container.name]) {
                                    container.status = statusMap[container.name];
                                }
                                if (container.image.indexOf('@') != -1) {
                                    ImageStream.get({
                                        namespace: $rootScope.namespace,
                                        name: imageStreamName(container.image),
                                        region:$rootScope.region
                                    }, function (res) {
                                        if (res.kind == 'ImageStream') {
                                            angular.forEach(res.status.tags, function (tag) {
                                                angular.forEach(tag.items, function (item) {
                                                    if (container.image.indexOf(item.image)) {
                                                        container.tag = tag.tag;
                                                    }
                                                });
                                            });
                                        }
                                    });

                                } else {
                                    container.tag = imageStreamName(container.image)[1];
                                }
                            });
                            // console.log('====', $scope.pod)
                        };
                        preparePod($scope.pod);
                        var watchpod = function (resourceVersion, contair) {
                            Ws.watch({
                                api: 'k8s',
                                resourceVersion: resourceVersion,
                                namespace: $rootScope.namespace,
                                type: 'pods',
                                name: $scope.pod.metadata.name + '/log',
                                pod: contair,
                                protocols: 'base64.binary.k8s.io'
                            }, function (res) {
                                //console.log(res);
                                //var data = JSON.parse(res.data);
                                //updateRcs(data);
                                //console.log(data);
                                if (res.data && typeof res.data == "string") {
                                    $scope.result += $base64.decode(res.data);
                                    var html = ansi_ups.ansi_to_html($scope.result);
                                    $scope.log = $sce.trustAsHtml(html);
                                    loglast()
                                    $scope.$apply();

                                }

                                //loglast()
                            }, function () {
                                $log.info("webSocket startRC");
                            }, function () {
                                $log.info("webSocket stopRC");
                                var key = Ws.key($rootScope.namespace, 'pods', $scope.pod);
                                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                                    return;
                                }
                                //watchpod($scope.resourceVersion);
                            });
                        };

                        //$scope.containerDetail = function (idx) {
                        //var o = pod.spec.containers[idx];
                        //$scope.grid.show = true;

                        //};

                        $scope.back = function () {
                            $scope.grid.show = false;
                        };

                        $scope.search = function () {
                            // console.log("sinceTime", $scope.grid.st);
                            $scope.getLog($scope.container.name);
                        };

                        $scope.getLog = function (container) {
                            var params = {
                                namespace: $rootScope.namespace,
                                name: pod.metadata.name,
                                container: container,
                                sinceTime: $scope.grid.st ? $scope.grid.st.toISOString() : (new Date(0)).toISOString()
                            };
                            //console.log('container', container);
                            Pod.get({namespace: $rootScope.namespace, name: pod.metadata.name,region:$rootScope.region}, function (podcenter) {
                                //console.log(podcenter.metadata.resourceVersion);
                                watchpod(podcenter.metadata.resourceVersion, container)
                            })
                        };

                        $scope.terminalSelect = function () {
                            $scope.terminalTabWasSelected = true;
                        };

                        $scope.terminalTabWasSelected = false;

                        var setChart = function (name, data) {
                            data = prepareData(name, data);
                            return {
                                options: {
                                    chart: {
                                        type: 'areaspline'
                                    },
                                    title: {
                                        text: name,
                                        align: 'left',
                                        x: 0,
                                        style: {
                                            fontSize: '12px'
                                        }
                                    },
                                    tooltip: {
                                        backgroundColor: '#666',
                                        borderWidth: 0,
                                        shadow: false,
                                        style: {
                                            color: '#fff'
                                        },
                                        formatter: function () {
                                            if (name == 'CPU') {
                                                return this.y.toFixed(2);
                                            }
                                            return (this.y / 1000000).toFixed(2) + 'M';
                                        }
                                    },
                                    legend: {
                                        enabled: false
                                    }
                                },
                                series: [{
                                    color: '#f6a540',
                                    fillOpacity: 0.3,
                                    marker: {
                                        enabled: false
                                    },
                                    data: data,
                                    pointStart: (new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000,
                                    pointInterval: 30000 //时间间隔
                                }],
                                xAxis: {
                                    type: 'datetime',
                                    gridLineWidth: 1
                                },
                                yAxis: {
                                    gridLineDashStyle: 'ShortDash',
                                    title: {
                                        text: ''
                                    }
                                },
                                size: {
                                    width: 798,
                                    height: 130
                                },
                                func: function (chart) {
                                    //setup some logic for the chart
                                }
                            };
                        };

                        var prepareData = function (tp, data) {
                            var res = [];
                            MetricsService.normalize(data, tp);
                            for (var i = 0; i < data.length - 1; i++) {
                                res.push(data[i].value);
                            }
                            return res;
                        };

                        var getMetrics = function (pod, container) {
                            var st = (new Date()).getTime() - 30 * 60 * 1000;
                            var gauges = container.name + '/' + pod.metadata.uid + '/memory/usage';
                            var counters = container.name + '/' + pod.metadata.uid + '/cpu/usage';
                            Metrics.mem.query({gauges: gauges, buckets: 61, start: st}, function (res) {
                                // $log.info("metrics mem", res);
                                $scope.chartConfigMem = setChart('内存', res);
                                $scope.grid.mem = true;
                            }, function (res) {
                                // $log.info("metrics mem err", res);
                                $scope.chartConfigMem = setChart('内存', []);
                                $scope.grid.mem = false;
                            });
                            Metrics.cpu.query({counters: counters, buckets: 61, start: st}, function (res) {
                                // $log.info("metrics cpu", res);
                                $scope.chartConfigCpu = setChart('CPU', res);
                                $scope.grid.cpu = true;
                            }, function (res) {
                                // $log.info("metrics cpu err", res);
                                $scope.chartConfigCpu = setChart('CPU', []);
                                $scope.grid.cpu = false;
                            });
                        };
                        //console.log('$scope.container', obj.name);
                        $scope.container = obj.name;
                        $scope.getLog(obj.name);
                        //terminal(o.name);
                        getMetrics(pod, obj);
                        $scope.chartConfigIo = setChart('网络IO', []);
                    }]
            }).result;
        };
    }])

