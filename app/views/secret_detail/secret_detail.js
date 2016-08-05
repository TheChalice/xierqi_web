'use strict';
angular.module('console.secret_detail', [
        {
            files: [

            ]
        }
    ])
    .controller('secretDetailCtrl', ['by','$state', '$http', '$scope', '$rootScope', 'listSecret', 'modifySecret', 'deleteSecret','$stateParams', 'delSecret',
        function(by, $state, $http, $scope, $rootScope, listSecret, modifySecret, deleteSecret,$stateParams, delSecret){
            $scope.grid = {
                status: false
            }
            $scope.err= {
                reminder: false
            }
            var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
            //list the detail of current secret
            console.log($stateParams.name);
            listSecret.get({namespace: $rootScope.namespace, name:$stateParams.name},function(res){
                console.log(res);
                $scope.item = res;
                $scope.secretarr = [];
                angular.forEach(res.data, function(res, i){
                    $scope.secretarr.push({k:i, v:res});
                })
            })
            $scope.addSecret = function(){
                $scope.secretarr.push({k:'',v:''});
            }
            $scope.rmsecret = function(idx){
                $scope.secretarr.splice(idx,1);

            }
            $scope.$watch('secretarr',function(newValue,oldValue){
                if(newValue == oldValue){
                    $scope.grid.status = false;
                    return;
                }else{
                    $scope.err.reminder = false;
                    var newarr = angular.copy(newValue);
                    newarr.sort(by.open('k'));
                    console.log(newarr);
                    for (var i=0; i<newarr.length; i++){
                    //if(newarr[i].k && newarr[i].v){
                    //    $scope.grid.status = true;
                    //}
                       if(newarr[i] && newarr[i+1]){
                           if(newarr[i].k == newarr[i+1].k){
                               $scope.err.reminder = true;
                           }
                       }
                    }
                }
            },true)

            $scope.updateSecret = function(){
                console.log('---',$scope.secretarr);
                for(var i = 0; i < $scope.secretarr.length; i++ ){
                    for( var j= i+1; j < $scope.secretarr.length; j++ ){
                        if($scope.secretarr[i].k == $scope.secretarr[j].k){
                            console.log('key值重了!!!');
                            return;
                        }
                    }
                    if(!$scope.secretarr[i].k || !$scope.secretarr[i].v){
                        console.log('err!!!!!!!!!!!!');
                        return;
                    }
                    var k = $scope.secretarr[i].k;
                    var v = $scope.secretarr[i].v;
                    $scope.item.data[k] = Base64.encode(v);
                }
                modifySecret.update({namespace: $rootScope.namespace, name:$stateParams.name}, $scope.item,function(res){
                    console.log('test the item', res);
                    Toast.open('保存成功')
                })
            }
            $scope.delete = function(){
                delSecret.del({namespace: $rootScope.namespace},function(){
                   $state.go('console.resource_management', {index:3})
                })
            }
        }]);