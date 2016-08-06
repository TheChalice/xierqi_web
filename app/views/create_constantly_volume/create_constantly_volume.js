'use strict';
angular.module('console.create_constantly_volume', [
    {
        files: []
    }
]).controller('createconvolumeCtrl', ['$rootScope','volume','$scope', function ($rootScope,volume,$scope) {
    $scope.danwei = 'GB';
    $scope.grid = {
        inved: false,
        num: false,
        dianji: false
    }
    $scope.volume = {
        name: '',
        size:''
    }

    $scope.$watch('volume.size', function (n, o) {
        if (n == o) {
            return
        }
        if (n && n !== "") {
            console.log(n);
            if (n < 10 || n > 200) {
                console.log('不过');
                $scope.grid.num=false
            } else {
                console.log('过');
                $scope.grid.num=true
            }
        }
    })
    //$scope.$watch('volume', function (n,o) {
    //    if (n == o) {
    //        return
    //    }
    //
    //    var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
    //
    //    if (n.name) {
    //        if (!r.test(n.name)) {
    //            $scope.grid.inved=true
    //        }else {
    //            $scope.grid.inved=false
    //
    //        }
    //    }
    //    if (n.size) {
    //        if (n < 10 || n > 200) {
    //            $scope.grid.num=true
    //        } else {
    //            $scope.grid.num=false
    //        }
    //    }
    //
    //},true);
    $scope.creat = function () {
        //console.log($scope.frm);
        console.log($scope.volume);
        volume.create({namespace: $rootScope.namespace},$scope.volume, function (res) {
            //alert(11111)
        }, function (err) {

        })

    }
}])