'use strict';
angular.module('console.dashboard', [
    {
        files: [

        ]
    }
])
    .controller('dashboardCtrl', ['$log', '$rootScope', '$scope', 'Metrics', 'MetricsService', function($log, $rootScope, $scope, Metrics, MetricsService){
        $scope.cpuData = [];
        $scope.memData = [];

        var setChart = function() {
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
                    data: $scope.cpuData,
                    pointStart: (new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000,
                    pointInterval: 3600 * 1000 //时间间隔
                },
                    {
                        color: '#c9c9c9',
                        fillOpacity: 0.3,
                        marker: {
                            enabled: false
                        },
                        data: $scope.memData,
                        pointStart: (new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000,
                        pointInterval: 3600 * 1000 //时间间隔
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
                    height: 230
                },

                func: function (chart) {
                    //setup some logic for the chart
                }
            };
        };

        var setPieChart = function(tp, dec, percent) {
            var subTitle = '<b style="font-size:16px;color:#f6a540;">' + tp + '</b><br>' +
                '<span style="color:#9fa7b7;">' + dec + '</span><br>' +
                '<b style="color:#5a6378;">已用' + percent + '%</b>';
            return {
                options: {
                    title: {
                        text: ''
                    },
                    tooltip: {
                        enabled: false
                    },
                    subtitle: {
                        text: subTitle,
                        style: {
                            lineHeight: '20px'
                        },
                        align: 'center',
                        verticalAlign: 'middle',
                        x: 0,
                        y: -10

                    }
                },
                series: [{
                    type: 'pie',
                    colors: ['#f6a540', '#c6c6c6'],
                    data: [
                        ['已用',   percent],
                        ['未使用', 100 - percent]
                    ],
                    dataLabels: {
                        enabled: false
                    },
                    innerSize: '88%'
                }],
                size: {
                    height: 200
                },

                func: function (chart) {
                    //setup some logic for the chart
                }
            };
        };

        var prepareData = function(tp, data){
            var res = [];
            MetricsService.normalize(data, tp);
            for (var i = 0; i < data.length - 1; i++) {
                res.push(data[i].value);
            }
            return res;
        };

        Metrics.cpu.all.query({tags: 'descriptor_name:cpu/usage,pod_namespace:' + $rootScope.namespace, buckets: 61}, function(res){
            $log.info('metrics cpu all', res);
            $scope.cpuData = prepareData('CPU', res);

            Metrics.mem.all.query({tags: 'descriptor_name:memory/usage,pod_namespace:' + $rootScope.namespace, buckets: 61}, function(res){
                $log.info('metrics mem all', res);
                $scope.memData = prepareData('内存', res);

                $scope.chartConfig = setChart();
                $scope.pieConfigCpu = setPieChart('CPU', '25.75HZ', 75.5);
                $scope.pieConfigMem = setPieChart('内存', '80G', 45.8);
            }, function(res){
                $log.info('metrics mem all err', res);
            });

        }, function(res){
            $log.info('metrics cpu all err', res);
        });
    }]);

