'use strict';
angular.module('console.dashboard', [
      {
        files: []
      }
    ])
    .controller('dashboardCtrl', ['$http', '$log', '$rootScope', '$scope', 'Metrics', 'MetricsService',
      function ($http, $log, $rootScope, $scope, Metrics, MetricsService) {
        $scope.cpuData = [];
        $scope.memData = [];
        $scope.isdata = {};

        // console.log((new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000);

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
              name:'cpu',
              color: '#f6a540',
              fillOpacity: 0.2,
              marker: {
                enabled: false
              },
              yAxis: 1,
              data: $scope.cpuData,
              pointStart: (new Date()).getTime()+3600 * 1000,
              pointInterval: 15 * 60 * 1000 //时间间隔
            },
              {
                name:'内存',
                color: '#5bc0de',
                fillOpacity: 0.2,
                marker: {
                  enabled: false
                },
                yAxis: 0,
                data: $scope.memData,
                pointStart: (new Date()).getTime()+3600 * 1000,
                pointInterval: 15 * 60 * 1000 //时间间隔
              }],
            xAxis: {
              // categories: ['12:00','14:00', '16:00', '18:00', '20:00', '22:00', '24:00'],
              type: 'datetime',
              gridLineWidth: 1
            },
            yAxis:[{
              // gridLineDashStyle: 'ShortDash',
              title: {
                text: '内存 (m)',
                style:{
                  color: '#5bc0de'
                }
              }

          },{
              // gridLineDashStyle: 'ShortDash',
              title: {
                text: 'cpu (%)',
                style:{
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

        var setPieChart = function (tp, dec, percent, quota) {
          var percentstr = '';
          if (quota == true) {
            // percentstr = '<b style="color:#5a6378;">已用' + percent + '%</b>';
            percentstr = '<b style="color:#5a6378;">已用' + percent + '%</b>';
          }
          var subTitle = '<b style="font-size:16px;color:#f6a540;">' + tp + '</b><br>' +
                  '<span style="color:#9fa7b7;">' + dec + '</span><br>' + percentstr
              ;
          return {
            options: {
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
              colors: ['#f6a540', '#c6c6c6'],
              data: [
                ['已用', percent],
                ['未使用', 100 - percent]
              ],
              dataLabels: {
                enabled: false
              },
              innerSize: '88%'
            }],
            size: {
              height: 200,
              width: 200
            },

            func: function (chart) {
              //setup some logic for the chart
            }
          };
        };

        // console.log((new Date()).getTime()-8 * 3600 * 1000);
        var prepareData = function (tp, data) {
          var res = [];
          MetricsService.normalize(data, tp);
          for (var i = 0; i < data.length - 1; i++) {
            res.push(data[i].value);
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
        
        Metrics.cpu.all.query({
          tags: 'descriptor_name:cpu/usage,pod_namespace:' + $rootScope.namespace,
          buckets: 30
        }, function (res) {
          $log.info('metrics cpu all', res);
          $scope.cpuData = prepareData('CPU', res);
          console.log('$scope.cpuData',$scope.cpuData)
          Metrics.mem.all.query({
            tags: 'descriptor_name:memory/usage,pod_namespace:' + $rootScope.namespace,
            buckets: 30
          }, function (res) {
            $log.info('metrics mem all', res);
            $scope.memData = prepareData('内存', res);
            console.log('$scope.memData',$scope.memData)
            $http.get('/api/v1/namespaces/' + $rootScope.namespace + '/resourcequotas').success(function (data, status, headers, config) {
              if (data.items[0]) {
                // console.log($scope.cpuData);
                // console.log($scope.memData);
                parseInt(data.items[0].spec.hard['limits.memory'])
                var cpu = [];
                var cpusun = 0;
                var mem = [];
                var memsun = 0;
                for (var i = 0; i < $scope.cpuData.length; i++) {
                  if ($scope.cpuData[i] != null) {
                    cpu.push($scope.cpuData[i])
                  }
                  if ($scope.memData[i] != null) {
                    mem.push($scope.memData[i])
                  }
                }
                for (var q = 0; q < cpu.length; q++) {
                  cpusun += cpu[q]
                }
                for (var w = 0; w < mem.length; w++) {
                  memsun += mem[w]
                }
                // console.log(cpusun,memsun)
                var cpunum = 0
                var memnum = 0
                if (cpu.length && mem.length) {
                  cpunum = cpusun / cpu.length / 500 * 100;
                  memnum = memsun / mem.length / 1000000 / 250 * 100;
                  cpunum = toDecimal(cpunum);
                  memnum = toDecimal(memnum);
                }

                // console.log(cpunum,memnum)
                //quotaed
                $scope.pieConfigCpu = setPieChart('CPU', data.items[0].spec.hard['limits.cpu'], cpunum, true);
                $scope.pieConfigMem = setPieChart('内存', data.items[0].spec.hard['limits.memory'], memnum, true);
                $scope.chartConfig = setChart();
                $scope.isdata.CpuorMem = true;
                $scope.isdata.charts = true;

              } else {
                var cpu = [];
                var cpusun = 0;
                var mem = [];
                var memsun = 0;
                for (var i = 0; i < $scope.cpuData.length; i++) {
                  if ($scope.cpuData[i] != null) {
                    cpu.push($scope.cpuData[i])
                  }
                  // console.log($scope.cpuData[i],$scope.memData[i])
                  if ($scope.memData[i] != null) {
                    mem.push($scope.memData[i])
                  }
                }
                // console.log(cpu,mem)
                for (var q = 0; q < cpu.length; q++) {
                  cpusun += cpu[q]
                }
                for (var w = 0; w < mem.length; w++) {
                  memsun += mem[w]
                }
                console.log(cpusun, memsun)
                if (cpusun || memsun) {
                  // var cpunum = cpusun / cpu.length / 500 * 100 || 0;
                  // var memnum = memsun / mem.length / 1000000 / 250 * 100 || 0
                   var cpunum = cpusun / cpu.length || 0;
                  var memnum = memsun / mem.length/1000000 || 0

                  cpunum = toDecimal(cpunum);
                  memnum = toDecimal(memnum);
                  // console.log(cpunum,memnum);
                  // $scope.pieConfigCpu = setPieChart('CPU', '500m', cpunum);
                  // $scope.pieConfigMem = setPieChart('内存', '250Mi', memnum);
                  //no quota.
                  $scope.pieConfigCpu = setPieChart('CPU', cpunum+'m', 0, false);
                  $scope.pieConfigMem = setPieChart('内存', memnum+'Mi', 0, false);
                  $scope.chartConfig = setChart();
                  $scope.isdata.CpuorMem = true;
                  $scope.isdata.charts = true;
                } else {
                  //no quota, no usage.
                  $scope.pieConfigCpu = setPieChart('CPU', 'N/A', 0);
                  $scope.pieConfigMem = setPieChart('内存', 'N/A', 0);
                  $scope.chartConfig = setChart();
                  $scope.isdata.CpuorMem = true;
                  $scope.isdata.charts = true;
                }

              }
              // console.log('配额', data);

            }).error(function (data, status, headers, config) {
              $scope.pieConfigCpu = setPieChart('CPU', 'N/A', 0);
              $scope.pieConfigMem = setPieChart('内存', 'N/A', 0);
            });
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

