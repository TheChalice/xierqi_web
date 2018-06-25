'use strict';
angular.module('console.create_constantly_persistentVolume', [
    {
        files: []
    }
]).controller('createconvolumeCtrl', ['persistent', 'Tip', 'checkout', 'market', 'Toast', '$state', '$rootScope', 'volume', '$scope', 'toastr',
    function (persistent, Tip, checkout, market, Toast, $state, $rootScope, volume, $scope, toastr) {

        $scope.slider = {
            value: 1,
            options: {
                floor: 1,
                ceil: 5,
                step: 1,
                showSelectionBar: true,
                showTicksValues: 1,
                translate: function (value, sliderId, label) {
                    switch (label) {
                        default:
                            return value + 'GB'
                    }
                }
            }
        };

        $scope.danwei = 'GB';
        $scope.grid = {
            configpost: false,
            inved: false,
            num: false,
            dianji: false
        };
        $scope.err = {
            blank: false,
            valid: false
        };
        $scope.volume = {
            name: '',
            size: '',
            metadata: {
                annotations: {
                    'dadafoundry.io/create-by': $rootScope.namespace
                }
            }
        };
        $scope.$watch('slider.value', function (n, o) {
            if (n == o) {
                return
            }
            if (n && n > 0) {
                $scope.grid.num = false

            }
        });
        $scope.namerr = {
            nil: false,
            rexed: false,
            repeated: false
        };
        // $scope.nameblur = function () {
        //     if (!$scope.volume.name) {
        //         $scope.namerr.nil = true
        //     } else {
        //         $scope.namerr.nil = false
        //     }
        // };
        $scope.namefocus = function () {
            $scope.namerr.nil = false
        };
        persistent.get({
            namespace: $rootScope.namespace,
            region: $rootScope.region
        }, function (res) {
            $scope.persmnamearr = res.items;
        });

        // var rex = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
        // $scope.$watch('volume.name', function (n, o) {
        //     if (n === o) {
        //         return;
        //     }
        //     if (n && n.length > 0) {
        //         $scope.grid.configpost = false;
        //         if (rex.test(n)) {
        //             $scope.namerr.rexed = false;
        //             $scope.namerr.repeated = false;
        //             $scope.grid.configpost = true;
        //             if ($scope.persmnamearr) {
        //                 //console.log($scope.buildConfiglist);
        //                 angular.forEach($scope.persmnamearr, function (bsiname, i) {
        //                     // console.log(bsiname);
        //                     if (bsiname.metadata.name === n) {
        //                         // console.log(bsiname,n);
        //                         $scope.namerr.repeated = true;
        //                         $scope.grid.configpost = false;
        //                     }
        //                     //console.log($scope.namerr.repeated);
        //                 })
        //             }
        //         } else {
        //             $scope.namerr.rexed = true;
        //             $scope.grid.configpost = false;
        //         }
        //     } else {
        //         $scope.namerr.rexed = false;
        //     }
        // });
        // $scope.empty = function () {
        //     if ($scope.volume.name === '') {
        //         $scope.err.blank = false;
        //         return
        //     }
        // };
        // $scope.isEmpty = function () {
        //     if ($scope.volume.name === '') {
        //         //alert(1)
        //         $scope.err.blank = true;
        //         return
        //     } else {
        //         $scope.err.blank = false;
        //     }
        //
        // };
        $scope.$watch('volume.name', function (n, o) {
            if (n === o) {
                return;
            }
            $scope.namerr = {
                nil: false,
                rexed: false,
                repeated: false
            };
        });
        $scope.create = function () {
            var rex = /^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
            if ($scope.volume.name === '') {
                $scope.namerr.nil = true;
                return
            } else if (!rex.test($scope.volume.name)) {
                $scope.namerr.rexed = true;
                return
            } else {
                for (var i = 0; i < $scope.persmnamearr.length; i++) {
                    if ($scope.volume.name === $scope.persmnamearr[i].metadata.name) {
                        $scope.namerr.repeated = true;
                        return
                    }
                }
            }
            if ($scope.slider.value === 0) {
                $scope.grid.num = true;
                return
            }
            $scope.volume.size = $scope.slider.value;
            $scope.loaded = true;
            volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
                //alert(11111)
                $scope.loaded = false;
                toastr.success('创建成功', {
                    closeButton: true
                });
                $state.go('console.resource_persistentVolume', {namespace: $rootScope.namespace});
            }, function (err) {
                $scope.loaded = false;
                // Toast.open('创建失败,请重试');
                toastr.error('创建失败，请重试', {
                    closeButton: true
                });
            });
        }
    }]);