'use strict';
angular.module('console.create_constantly_volume', [
    {
        files:[
        ]
    }
]).controller('createfigvolumeCtrl',['$scope','Upload',function($scope){
   $scope.volume = {
        "kind": "ConfigMap",
            "apiVersion": "v1",
            "metadata": {
            "name": ""
        },
       "data": {

       }
    }
    $scope.grid = {
        configpost : false,
        configno : true
    }

    //// 添加配置文件
    $scope.configarr = [];
    function readSingleFile(e) {
        var thisfilename = this.value;
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            displayContents(contents,thisfilename);
        };
        reader.readAsText(file);
    }

    function displayContents(content,thisfilenames) {
        //var element = document.getElementById('file-content');
        //element.innerHTML = contents;
        if($scope.configarr.length != 0){
            for(var i = 0 ; i < $scope.configarr.length;i++){
                if($scope.configarr[i] != thisfilenames){
                    $scope.configarr.push(thisfilenames)
                    $scope.volume.data[thisfilenames]= content;
                }else{
                    return;
                }
            }
        }else{
            $scope.configarr.push(thisfilenames)
            $scope.volume.data[thisfilenames]= content;
        }

        $scope.grid.configpost = true;
        $scope.grid.configno = false;
        $scope.$apply();
    }

    document.getElementById('file-input').addEventListener('change', readSingleFile, false);

    $scope.delvolume = function(v,idx){
        delete $scope.volume.data[v];
        $scope.configarr.splice(idx,1);
        if($scope.configarr.length ==0 && $scope.configitems.length == 0){
            $scope.grid.configpost = false;
            $scope.grid.configno = true;
        }
    }

    /////手动配置
    $scope.configitems = [];
    $scope.addConfig = function(){
        $scope.configitems.push({idx1:'',idx2:''});
        console.log($scope.configitems);
    }
    $scope.checkVname = function(ve){
        angular.forEach($scope.volume.data,function(item,i){
            if(i == ve){
                $scope.grid.configpost = false;
                $scope.grid.configno = true;
            }
        })
    }
    $scope.checkvobj = function(idx){
        if($scope.configitems[idx].idx1 && $scope.configitems[idx].idx2) {
            var k = $scope.configitems[idx].idx1;
            var v = $scope.configitems[idx].idx2;
            $scope.volume.data[k] = v;
            console.log($scope.volume.data)
        }
    }
    $scope.rmconfigitem = function(idx){
        $scope.configitems.splice(idx,1);
        if($scope.configarr.length ==0 && $scope.configitems == 0){
            $scope.grid.configpost = false;
            $scope.grid.configno = true;
        }
    }
}])