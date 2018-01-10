'use strict';
angular.module('console.pods_detail', [
        {
            files: [
                'views/pods_detail/pods_detail.css',
                'components/deploymentsevent/deploymentsevent.js'
            ]
        }
    ])
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'mypod','Ws',
        function ($rootScope, $scope, $state, $log,mypod,Ws) {
            $scope.pod=angular.copy(mypod)
            $scope.environment = $scope.pod.spec.containers[0].env;

            $scope.$on('$destroy', function () {
                Ws.clear();
            });
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
                    $scope.$on('$destroy', function () {
                        Ws.clear();
                    });
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


