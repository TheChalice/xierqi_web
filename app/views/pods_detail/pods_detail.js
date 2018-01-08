'use strict';
angular.module('console.pods_detail', [
        {
            files: [
                'views/pods_detail/pods_detail.css'
            ]
        }
    ])
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'podDetails',
        function ($rootScope, $scope, $state, $log,podDetails) {

            if (podDetails) {
                //console.log("pod.status.containerStatuses12",podDetails.status.containerStatuses)
                //$scope.Pod = podDetails;
                $scope.Pod = angular.copy(podDetails);
                console.log("podDetails12",podDetails);
                //$scope.rc = angular.copy(podDetails);
                
                $scope.environment = $scope.Pod.spec.containers[0].env;
                console.log("environment",$scope.environment);
                //.spec.containers["0"].env[1].name

                //.spec.containers["0"].env
                
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

            
            
        }]);

