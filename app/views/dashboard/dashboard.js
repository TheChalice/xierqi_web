'use strict';
angular.module('console.dashboard', [
    {
        files: [

        ]
    }
])
    .controller('dashboardCtrl', ['$log', '$scope', function($log, $scope){
        $scope.chartConfig = {
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
                data: [1,2,3,4,5,6,6,8,32,3,567,44,2,546,75,4,345,3,343,34,234],
                pointStart: (new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000,
                pointInterval: 3600 * 1000 //时间间隔
            },
            {
                color: '#c9c9c9',
                fillOpacity: 0.3,
                marker: {
                    enabled: false
                },
                data: [1,2,3,4,5,7,44,2,75,4,345,3,343,3,6,6,8,32,3,56,34],
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

        $scope.pieConfigCpu = setPieChart('CPU', '25.75HZ', 75.5);
        $scope.pieConfigMem = setPieChart('内存', '80G', 45.8);

    }]);

