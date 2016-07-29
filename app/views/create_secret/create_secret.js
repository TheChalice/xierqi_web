'use strict';
angular.module('console.create_secret', [
    {
        files:[
        ]
    }
]).controller('createSecretCtrl',['$scope','$rootScope','secretskey','$base64',function($scope,$rootScope,secretskey,$base64){
        $scope.grid = {
            secreteno : false
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
    }


    $scope.postsecret = function(){
        console.log($scope.secretsarr)
        for(var i = 0 ; i<$scope.secretsarr.length; i++){
            for(var j=i+1;j<$scope.secretsarr.length;j++){
                if($scope.secretsarr[i].idx1 == $scope.secretsarr[j].idx1){
                    console.log('key值重了!!!');
                    return;
                }
            }
            if(!$scope.secretsarr[i].idx1 || !$scope.secretsarr[i].idx2){
                console.log('err!!!!!!!!!!!!')
                return;
            }
            var k = $scope.secretsarr[i].idx1;
            var v = $scope.secretsarr[i].idx2;
            $scope.secrets.data[k] = $base64.encode(v);
            console.log($scope.secrets.data)
        }
        secretskey.create({namespace: $rootScope.namespace},$scope.secrets , function (res) {
            console.log('createconfig----',res);
        })

    }
}])
