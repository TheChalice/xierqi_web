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
                width: 798,
                height: 130
            },

            func: function (chart) {
                //setup some logic for the chart
            }
        };
        //pie chart
        $scope.chartConfigFirst = {

            func: function (chart) {
                //setup some logic for the chart
            }
        };
    }]);

