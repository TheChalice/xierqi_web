'use strict';
angular.module('console.create_constantly_volume', [
    {
        files: []
    }
]).controller('createconvolumeCtrl', ['market','Toast','$state', '$rootScope', 'volume', '$scope',
    function (market,Toast,$state, $rootScope, volume, $scope) {
    $scope.slider = {
        value: 0,
        options: {
            floor: 0,
            ceil: 200,
            step: 10,
            showSelectionBar: true,
            showTicksValues:50,
            translate: function(value, sliderId, label) {
                switch (label) {

                    default:
                        return  value + 'GB'
                }
            }
        }
    };

    $scope.danwei = 'GB';
    $scope.grid = {
        inved: false,
        num: false,
        dianji: false
    }
    $scope.err= {
        blank:false,
        valid:false
    }
    $scope.volume = {
        name: '',
        size: '',
        metadata: {
            annotations: {
                'dadafoundry.io/create-by': $rootScope.namespace
            }
        }
    }
    //type=persistent_volume
    market.get({region:$rootScope.region,type:'persistent_volume'}, function (data) {
        console.log(data.plans);
        $scope.plans = data.plans
    })
    $scope.$watch('slider.value', function (n, o) {
        if (n == o) {
            return
        }
        if (n && n >0) {
            $scope.grid.num=false

        }
    })
    $scope.$watch('volume.name', function (n, o) {
        if (n == o) {
            return
        }
        if (n && n!=="") {
            $scope.err.blank = false;
            $scope.err.valid = false;

        }
    })

    $scope.creat = function () {
        var r = /^[a-z]+$/

        if ($scope.volume.name==='') {
            //alert(1)
            $scope.err.blank = true;
            return
        } else if (!r.test($scope.volume.name)) {
            //alert(2)
            $scope.err.valid = true;
            return
        }

        if ($scope.slider.value === 0) {
            $scope.grid.num=true;
            return
        }
        $scope.volume.size=$scope.slider.value
        angular.forEach($scope.plans, function (plan,i) {
            if ($scope.slider.value === plan.plan_level) {
                $scope.plan_id = plan.plan_id;
            }
        })

        $scope.loaded = true;
        //console.log($scope.volume);
        volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
            //alert(11111)
            $scope.loaded = false;
            $state.go('console.resource_management', {index: 1});
        }, function (err) {
            $scope.loaded = false;
            Toast.open('构建失败,请重试');
        })

    }
}])