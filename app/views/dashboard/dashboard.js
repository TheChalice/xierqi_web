'use strict';
angular.module('console.dashboard', [
        {
            files: [
                'views/dashboard/dashboard.css'
            ]
        }
    ])
    .controller('dashboardCtrl', ['$interval', 'PieChar', 'checkout', 'resourcequotas', 'Project', 'recharge', 'balance', '$http', '$log', '$rootScope', '$scope', 'Metrics', 'MetricsService', 'Pod', 'DeploymentConfig', 'BackingServiceInstance', 'account', 'market',
        function ($interval, PieChar, checkout, resourcequotas, Project, recharge, balance, $http, $log, $rootScope, $scope, Metrics, MetricsService, Pod, DeploymentConfig, BackingServiceInstance, account, market) {
            $scope.cpuData = [];
            $scope.memData = [];
            $scope.isdata = {};
            $scope.oldpiedata = {
                usage_rate: {name: 'CPU', use: 0, unit: ' cores'},
                usage: {name: 'memory', use: 0, unit: ' MiB'},
                network:{name: 'network', use: 0, unit: ' KiB/s'},
                rx_rate: {name: 'rx_rate', use: 0, unit: ' KiB/s'},
                tx_rate: {name: 'tx_rate', use: 0, unit: ' KiB/s'}
            }
            var timesnow = (new Date()).getTime()

            var PieCharobj = {
                "tags": "descriptor_name:network/tx_rate|network/rx_rate|memory/usage|cpu/usage_rate,type:pod",
                "bucketDuration": "1mn",
                "start": "-1mn"
            }

            function piechardawn() {
                PieChar.create(PieCharobj, function (data) {
                    $scope.newpiedata = angular.copy($scope.oldpiedata)
                    angular.forEach(data.gauge, function (item, i) {
                        var k = i.split('/')[i.split('/').length - 1];
                        if (!item[0].empty) {
                            $scope.newpiedata[k].use += item[0].avg
                        }
                    })
                    angular.forEach($scope.newpiedata, function (item,i) {
                        if(item.name === 'network') {
                            item.use = item.use / 1024
                        }
                    })
                    $scope.newpiedata.network.use=$scope.newpiedata.rx_rate.use+$scope.newpiedata.tx_rate.use;
                    angular.forEach($scope.newpiedata, function (item, i) {
                        if (item.name === 'memory') {
                            item.use = item.use / 1024 / 1024
                        }else if(item.name === 'CPU'){
                            item.use = item.use / 1000
                        }else  {
                            item.use = item.use / 1024
                        }
                        item.use = Math.round(item.use * 100) / 100;
                        $scope[i] = setPieChart(item.name, item.use + item.unit, 0, false);
                    })

                })
            }

            piechardawn()
            var timer = $interval(function () {
                piechardawn()
            }, 60000);
            $scope.$on("$destroy",
                function () {
                    $interval.cancel(timer);
                }
            );

            $scope.$watch('namespace', function (n, o) {
                if (n === o) {
                    return
                }
                if (n !== "") {
                    loadProject()
                }

            })
            var loadProject = function () {
                //$log.info("load project");
                Project.get({region: $rootScope.region}, function (data) {
                    angular.forEach(data.items, function (item, i) {
                        if (item.metadata.name === $rootScope.namespace) {
                            $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                        }
                    })
                    //$scope.projectname =
                    //$log.info("project", data);
                }, function (res) {
                    $log.info("find project err", res);
                });
            };

            Project.get({region: $rootScope.region}, function (data) {
                angular.forEach(data.items, function (item, i) {
                    if (item.metadata.name === $rootScope.namespace) {
                        $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                    }

                    data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                })
                data.items.sort(function (x, y) {
                    return x.sortname > y.sortname ? 1 : -1;
                });
                angular.forEach(data.items, function (project, i) {
                    if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                        //console.log(project.metadata.annotations['openshift.io/display-name']);
                        //data.items.push(project);
                        data.items.unshift(project);

                        data.items.splice(i + 1, 1);
                    }
                });
                $rootScope.projects = data.items;
            }, function (res) {
                $log.info("find project err", res);
            });
            $scope.plans = {
                cpu: "",
                ram: "",
                price: null,
                planName: null
            }


            var netChart = function () {
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
                        name: 'network_tx',
                        fillColor: {
                            linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                            stops: [
                                [0, Highcharts.Color('#4ca7de').setOpacity(0.1).get('rgba')],
                                [1, '#4ca7de']
                            ]
                        },
                        lineColor: '#fff',
                        fillOpacity: 0.6,
                        marker: {
                            enabled: false
                        },
                        yAxis: 1,
                        data: $scope.nettxdata,
                        pointStart: timesnow + 3600 * 1000,
                        pointInterval: 15 * 60 * 1000 //时间间隔
                    }, {
                        name: 'network_rx',
                        fillColor: {
                            linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                            stops: [
                                [0, Highcharts.Color('#79d87e').setOpacity(0.1).get('rgba')],
                                [1, '#79d87e']
                            ]
                        },
                        lineColor: '#fff',
                        fillOpacity: 0.6,
                        marker: {
                            enabled: false
                        },
                        yAxis: 0,
                        data: $scope.netrxdata,
                        pointStart: timesnow + 3600 * 1000,
                        pointInterval: 15 * 60 * 1000 //时间间隔
                    }],
                    xAxis: {
                        // categories: ['12:00','14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
                        type: 'datetime',
                        gridLineWidth: 1
                    },
                    yAxis: [{
                        title: {
                            text: 'network_rx (KB／s)',
                            style: {
                                color: '#79d87e'
                            }
                        }

                    },{
                        title: {
                            text: 'network_tx (KB／s)',
                            style: {
                                color: '#4ca7de'
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
            var setChart = function () {
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
                                [0, Highcharts.Color('#f8b551').setOpacity(0.1).get('rgba')],
                                [1, '#f8b551']
                            ]
                        },
                        lineColor: '#fff',
                        fillOpacity: 0.6,
                        marker: {
                            enabled: false
                        },
                        yAxis: 1,
                        data: $scope.cpuData,
                        pointStart: timesnow + 3600 * 1000,
                        pointInterval: 15 * 60 * 1000 //时间间隔
                    },
                        {
                            name: '内存',
                            fillColor: {
                                linearGradient: {x1: 0, y1: 1, x2: 0, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                                stops: [
                                    [0, Highcharts.Color('#c4cddc').setOpacity(0.1).get('rgba')],
                                    [1, '#c4cddc']
                                ]
                            },
                            lineColor: '#fff',
                            fillOpacity: 0.6,
                            marker: {
                                enabled: false
                            },
                            yAxis: 0,
                            data: $scope.memData,
                            pointStart: timesnow + 3600 * 1000,
                            pointInterval: 15 * 60 * 1000 //时间间隔
                        }],
                    xAxis: {
                        type: 'datetime',
                        gridLineWidth: 1
                    },
                    yAxis: [{
                        title: {
                            text: 'memory (M)',
                            style: {
                                color: '#bec0c7'
                            }
                        }

                    }, {
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

            var setPieChart = function (tp, dec, percent, quota, color) {
                var percentstr = '';
                if (quota == true) {
                    percentstr = '<b style="color:#5a6378; font-size: 14px">已用' + percent + '%</b>';
                }
                //配额
                var subTitle = '<b style="font-size:14px;color:#47B2FB;">' + tp + '</b><br>' +
                        '<span style="color:#333333; font-size:14px;">' + dec + '</span><br>' + percentstr
                    ;
                return {
                    options: {
                        chart: {
                            type: 'pie'
                        },
                        "plotOptions": {
                            "series": {
                                "stacking": "",
                                linecap: 'square'
                            }, point: {
                                events: {
                                    mouseOver: function(e) {  // 鼠标滑过时动态更新标题
                                        // 标题更新函数，API 地址：https://api.hcharts.cn/highcharts#Chart.setTitle
                                        console.log(e);
                                        chart.setTitle({
                                            text: e.target.name+ '\t'+ e.target.y + ' %'
                                        });
                                    }
                                    //,
                                    // click: function(e) { // 同样的可以在点击事件里处理
                                    //     chart.setTitle({
                                    //         text: e.point.name+ '\t'+ e.point.y + ' %'
                                    //     });
                                    // }
                                }
                            }


                        },
                        title: {
                            text: ''
                        },
                        tooltip: {
                            enabled: false
                        },
                        credits: {
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
                        colors: [{
                            linearGradient: {x1: 0, y1: 0, x2: 1, y2: 0}, //横向渐变效果 如果将x2和y2值交换将会变成纵向渐变效果
                            stops: [
                                [0, Highcharts.Color('#469450').setOpacity(1).get('rgba')],
                                [1, Highcharts.Color('#2196f3').setOpacity(1).get('rgba')]
                            ]
                        }, '#c6c6c6'],
                        data: [
                            ['已用', percent],
                            ['未使用', 100-percent]
                        ],
                        dataLabels: {
                            enabled: false
                        },
                        innerSize: '90%'
                    }],
                    size: {
                        height: 180,
                        width: 180
                    },

                    func: function (chart) {

                    }
                };
            };
            angular.forEach($scope.oldpiedata, function (item, i) {
                $scope[i] = setPieChart(item.name,'loading...', 0.1);
            })
            // console.log((new Date()).getTime()-8 * 3600 * 1000);
            var prepareData = function (tp, data) {
                var res = [];
                MetricsService.normalize(data, tp);
                for (var i = 0; i < data.length - 1; i++) {
                    res.push(data[i].avg);
                }
                return res;
            };
            var toDecimal = function (x) {
                var f = parseFloat(x);
                if (isNaN(f)) {
                    return;
                }
                f = Math.round(x * 10000) / 10000;
                return f;
            }

            //https://hawkular-metrics.new.dataos.io/hawkular/metrics/gauges/pod/b2fc3818-ad7d-11e7-ad35-fa163e095b60/network/rx_rate/data?bucketDuration=120000ms&start=-60mn
            Metrics.network.all.query({
                tags: 'descriptor_name:network/tx_rate,pod_namespace:' + $rootScope.namespace,
                'start': "-6h",
                bucketDuration: "12mn"
            }, function (networktx) {
                Metrics.network.all.query({
                    tags: 'descriptor_name:network/rx_rate,pod_namespace:' + $rootScope.namespace,
                    'start': "-6h",
                    bucketDuration: "12mn"

                }, function (networkrx) {

                    $scope.nettxdata = [];
                    $scope.netrxdata = [];
                    angular.forEach(networkrx, function (input, i) {
                        //console.log(input.avg);
                        $scope.nettxdata.push(Math.round(input.avg * 100) / 100)
                    })
                    angular.forEach(networktx, function (input, i) {
                        $scope.netrxdata.push(Math.round(input.avg * 100) / 100)
                    })

                    //console.log('$scope.nettxdata', $scope.nettxdata);
                    $scope.chartnetConfig = netChart();
                    //console.log('$scope.netrxdata', $scope.netrxdata);
                })
            })

            Metrics.cpu.all.query({
                tags: 'descriptor_name:cpu/usage,pod_namespace:' + $rootScope.namespace,
                'start': "-6h",
                bucketDuration: "12mn"
            }, function (res) {
                 $log.info('metrics cpu all', res);
                angular.forEach(res, function (mem,i) {
                    if (mem.empty) {
                        $scope.cpuData.push(0)
                    }else {
                        $scope.cpuData.push(Math.round(mem.avg/1024/1024/1024 * 10000) / 10000)
                    }
                })

                Metrics.mem.all.query({
                    tags: 'descriptor_name:memory/usage,pod_namespace:' + $rootScope.namespace,
                    'start': "-6h",
                    bucketDuration: "12mn"
                }, function (res) {
                     $log.info('metrics mem all', res);
                    angular.forEach(res, function (mem,i) {
                        if (mem.empty) {
                            $scope.memData.push(0)
                        }else {
                            $scope.memData.push(Math.round(mem.avg/1024/1024 * 100) / 100)
                        }
                    })
                    $scope.chartConfig = setChart();


                }, function (res) {
                    $log.info('metrics mem all err', res);
                    $scope.pieConfigCpu = setPieChart('CPU', 'N/A', 0);
                    $scope.pieConfigMem = setPieChart('内存', 'N/A', 0);
                });

            }, function (res) {
                $log.info('metrics cpu all err', res);
                $scope.isdata.CpuorMem = true;
                $scope.isdata.charts = false;
                $scope.pieConfigCpu = setPieChart('CPU', 'N/A', 0);
                $scope.pieConfigMem = setPieChart('内存', 'N/A', 0);
            });

            $scope.isdata.CpuorMem = true;
            $scope.isdata.charts = false;
            $scope.pieConfigCpu = setPieChart('CPU', 'loading...', 0.1);
            $scope.pieConfigMem = setPieChart('内存', 'loading...', 0.1);


        }]);

