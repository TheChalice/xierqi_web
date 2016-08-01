'use strict';
angular.module('console.create_secret', [
    {
        files:[
        ]
    }
]).controller('createSecretCtrl',['$scope','$rootScope','secretskey','$base64',function($scope,$rootScope,secretskey,$base64){
        $scope.grid = {
            secreteno : false,
            secretnames : true
        }
    $scope.secrets = {
        "kind": "Secret",
        "apiVersion": "v1",
        "metadata": {
            "name": ""
        },
        "data": {

        },
        "type": "Opaque"
    }
    $scope.secretsarr = [];
    $scope.addSecret = function(){
        $scope.secretsarr.push({idx1:'',idx2:''});
        console.log($scope.secretsarr);
    }
    $scope.rmsecret = function(idx){
        $scope.secretsarr.splice(idx,1);
        if($scope.secretsarr.length<=0){
            $scope.grid.secreteno = false;
        }
    }
    $scope.checknames = function(){
        var r = /^[a-z][-a-z0-9]*[a-z0-9]$/;
        if(!r.test($scope.secrets.metadata.name)){
            $scope.grid.secretnames = false;
        }else{
            $scope.grid.secretnames = true;
        }

        console.log($scope.grid.secretnames)
    }
    $scope.checkedkv = function(){
        var r = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/; // key值的验证;
       for(var i = 0; i < $scope.secretsarr.length; i++ ){
           if($scope.secretsarr[i].idx1 && $scope.secretsarr[i].idx2 && r.test($scope.secretsarr[i].idx1)){
               $scope.grid.secreteno = true;
           }else{
               $scope.grid.secreteno = false;
           }
       }
    }

    $scope.postsecret = function(){
        console.log($scope.secretsarr)
        for(var i = 0 ; i<$scope.secretsarr.length; i++){
            for(var j=i+1;j<$scope.secretsarr.length;j++){
                if($scope.secretsarr[i].idx1 == $scope.secretsarr[j].idx1){
                    console.log('key值重了!!!');
                    $scope.grid.secreteno = false;
                    return;
                }
            }
            if(!$scope.secretsarr[i].idx1 || !$scope.secretsarr[i].idx2){
                console.log('err!!!!!!!!!!!!');
                $scope.grid.secreteno = false;
                return;
            }
            var k = $scope.secretsarr[i].idx1;
            var v = $scope.secretsarr[i].idx2;
            $scope.secrets.data[k] = $base64.encode(v);
            console.log($scope.secrets.data)
        }
        $scope.grid.secreteno = true;
        secretskey.create({namespace: $rootScope.namespace},$scope.secrets , function (res) {
            console.log('createconfig----',res);
        })

    }
}])
