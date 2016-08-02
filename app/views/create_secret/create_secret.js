'use strict';
angular.module('console.create_secret', [
    {
        files:[
        ]
    }
]).controller('createSecretCtrl',['$scope','$rootScope','secretskey','$state',function($scope,$rootScope,secretskey,$state){
        $scope.grid = {
            secreteno : false,
            secretnames : true,
            nameerr : false
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
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
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
            $scope.secrets.data[k] = Base64.encode(v);
        }
        $scope.grid.secreteno = true;
                secretskey.create({namespace: $rootScope.namespace},$scope.secrets , function (res) {
                    $scope.grid.nameerr = false;
                    console.log('createconfig----',res);
                    $state.go('console.resource_management', {idx:1});
                },function(res){
                    if(res.status == 409){
                        $scope.grid.nameerr = true;
                    }
                })

    }
}])
