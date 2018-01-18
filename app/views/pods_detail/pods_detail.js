'use strict';
angular.module('console.pods_detail', [
        'kubernetesUI',
        {
            files: [
                'views/pods_detail/pods_detail.css',
                'components/deploymentsevent/deploymentsevent.js'
            ]
        }
    ])
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'mypod','Ws','Metrics',
        function ($rootScope, $scope, $state, $log,mypod,Ws,Metrics) {
            $scope.pod=angular.copy(mypod)  
            $scope.containers = $scope.pod.spec.containers;
            $scope.environment = $scope.pod.spec.containers[0].env;
            $scope.$on('$destroy', function () {
                Ws.clear();
            });

             // newChart 曲线组件方法
             var netChart = function (title,arr) {
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

            var getOwnerReferences = function(apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };
            
            //作用
            var filterForController = function(apiObjects, controller) {
                var controllerUID = _.get(controller, 'metadata.uid');
                return _.filter(apiObjects, function(apiObject) {
                    return _.some(getOwnerReferences(apiObject), {
                        uid: controllerUID,
                        controller: true
                    });
                });
            }

            

        
            var podschat = function(name,uid,type){
                Metrics.mem.query({
                    gauges: name+'/'+uid+'/'+type,
                    bucketDuration: '120000ms',
                    start:'1516103373792'
                }, function (res) {
                           console.log('-------------------------res',res) 
                           $scope.CpuConfig = netChart('CPU/cores',res);
                        
                })        
            }

            podschat(mypod.spec.containers[0].name,mypod.metadata.uid,'network/rx_rate');
            
        

            
            
        }])


