'use strict';
angular.module('console.pods', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/pods/pods.css'
        ]
    }])
    .controller('PodsCtrl', ['$scope', 'Pod',
        function($scope, Pod) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.items = [];
            Pod.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items
                    // res.items.forEach(item => {
                    //     let pod = {};
                    //     pod.name = item.metadata.name;
                    //     pod.age = item.metadata.creationTimestamp;
                    //     pod.status = item.status.phase;
                    //     if (item.status.containerStatuses !== null && item.status.containerStatuses !== undefined && item.status.containerStatuses.length !== 0) {
                    //         let containerArr = item.status.containerStatuses,
                    //             iRestart = 0,
                    //             iReady = 0,
                    //             cnt;
                    //         containerArr.forEach(container => {
                    //             if (container.ready) { iReady = iReady + 1 }
                    //             if (container.restartCount !== 0) { iRestart = iRestart + 1 }
                    //         })
                    //         cnt = containerArr.length;
                    //         pod.ready = iReady + '/' + cnt;
                    //         pod.restart = iRestart;
                    //         if (item.status.phase === 'Failed' || item.status.phase === 'Succeeded') {
                    //             pod.status = containerArr[cnt - 1].state.terminated.reason;
                    //         }
                    //     } else {
                    //         if (item.status.phase === 'Failed') {
                    //             pod.status = item.status.reason;
                    //         }
                    //         pod.ready = '0/1';
                    //         pod.restart = '0';
                    //     }
                    //     $scope.items.push(pod);
                    // });
            });

        }
    ]);