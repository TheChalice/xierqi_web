'use strict';
angular.module('console.create_constantly_volume', [
    {
        files:[
        ]
    }
]).controller('createfigvolumeCtrl',['$rootScope','$scope','configmaps',function($rootScope,$scope,configmaps){
   $scope.volume = {
        "kind": "ConfigMap",
            "apiVersion": "v1",
            "metadata": {
            "name": ""
        },
       "data": {
        length:0
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
        if (thisfilename.indexOf('\\')) {
            var arr=thisfilename.split('\\');
            thisfilename=arr[arr.length-1]
        }
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            //console.log(contents, thisfilename);
            displayContents(contents,thisfilename);
            $scope.$apply();
        };
        reader.readAsText(file);
        //$scope.$apply();
    }
   //$scope.volume.data.length
    $scope.$watch('volume.data.length', function (n,o) {
        if (n == o) {
            return
        }else {
            console.log($scope.volume.metadata.name);
            if ($scope.volume.metadata.name && $scope.volume.data.length > 0) {
                $scope.grid.configpost = true;
            }
            //console.log($scope.configarr);
            //console.log($scope.configitems);

            //alert(111)
        }

    })

    function displayContents(content,thisfilenames) {
        //var element = document.getElementById('file-content');
        //element.innerHTML = contents;
        //console.log(content, thisfilenames,$scope.configarr.length);
        if($scope.configarr.length != 0){

            //console.log($scope.volume.data);

            //for(var i = 0 ; i < $scope.configarr.length;i++){
            //    if($scope.configarr[i] != thisfilenames){
            //        $scope.configarr.push(thisfilenames)
            //        $scope.volume.data[thisfilenames]= content;
            //    }else{
            //        return;
            //    }
            //}
            //console.log($scope.volume.data);
            var norepeat = true;
            for (var i = 0 ; i < $scope.configarr.length;i++) {
                if (!norepeat) {
                    if ($scope.configarr[i] == thisfilenames) {
                        //alert('重复了');
                        norepeat = false;
                        return
                    }
                }
            }
            if (norepeat) {
                $scope.configarr.push(thisfilenames)
                $scope.volume.data[thisfilenames]= content;
                $scope.volume.data.length++

            }

        }else{
            //alert(11111)

            var tiaochu = true
            angular.forEach($scope.configarr, function (itemw,i) {
                if (tiaochu) {
                    angular.forEach($scope.configitems, function (items,k) {

                        //console.log($scope.configarr[i],items);
                        if ($scope.configarr[i] == items.idx1) {
                            alert('重复了');
                            tiaochu=false
                            return;
                            //$scope.grid.configno = false;
                        }
                    })
                }

            })
            if (tiaochu) {
                $scope.configarr.push(thisfilenames);
                $scope.volume.data[thisfilenames]= content;
                $scope.volume.data.length++

            }

        }

        //$scope.grid.configpost = true;
        //$scope.grid.configno = false;
        $scope.$apply();
    }

    document.getElementById('file-input').addEventListener('change', readSingleFile, false);

    $scope.delvolume = function(v,idx){
        delete $scope.volume.data[v];
        $scope.configarr.splice(idx,1);

        if($scope.configarr.length ==0 && $scope.configitems.length == 0){
            $scope.grid.configpost = false;
            //$scope.grid.configno = true;
        }

    }

    /////手动配置
    $scope.configitems = [];
    $scope.addConfig = function(){
        $scope.grid.configpost = false;
        $scope.configitems.push({idx1:'',idx2:''});
        //console.log($scope.configitems);
    }

    $scope.checkVname = function(ve,idx){
        console.log(ve);
        var norepate = true;
        angular.forEach($scope.configarr,function(item,i){
            if (norepate) {
                if(item == ve){
                    console.log('重复了');
                    //$scope.congfu=true;
                    norepate = false;
                    $scope.grid.configpost = false;
                    //$scope.grid.configno = true;
                }
            }

        })
        angular.forEach($scope.configitems, function (item,i) {
            if (norepate) {
                if (i != idx&&item.idx1 == ve) {
                    norepate = false;
                    console.log('重复了')
                    $scope.grid.configpost = false;
                    //$scope.grid.configno = true;

                }
            }


        })
        if (norepate) {
            $scope.grid.configpost=true;
        }


    }
$scope.checkvobjb= function (idx) {
    var norepate = true;
    if($scope.configitems[idx].idx1 && $scope.configitems[idx].idx2) {
        console.log($scope.configarr, $scope.configitems[idx].idx1);
        angular.forEach($scope.configarr,function(item,i){
            console.log(item)
            if (norepate) {
                //console.log(item, $scope.configitems[idx].idx1);
                if(item == $scope.configitems[idx].idx1){
                    norepate = false;
                    console.log('重复了')

                    $scope.grid.configpost = false;
                    //$scope.grid.configno = true;
                }
            }
            //console.log(i, ve);

        })
        angular.forEach($scope.configitems, function (item,i) {
            if (norepate) {
                if (i != idx&&item.idx1 == $scope.configitems[idx].idx1) {
                    norepate = false;
                    console.log('重复了')
                    $scope.grid.configpost = false;
                    //$scope.grid.configno = true;
                }
            }

        })
        if (norepate) {
            var k = $scope.configitems[idx].idx1;
            var v = $scope.configitems[idx].idx2;

            $scope.volume.data[k] = v;
            $scope.volume.data.length++
        }

    }
}
    $scope.checkvobj = function(idx){
        var norepate = true;
        if($scope.configitems[idx].idx1 && $scope.configitems[idx].idx2) {
            console.log($scope.configarr, $scope.configitems[idx].idx1);
            angular.forEach($scope.configarr,function(item,i){
                console.log(item)
                if (norepate) {
                    //console.log(item, $scope.configitems[idx].idx1);
                    if(item == $scope.configitems[idx].idx1){
                        norepate = false;
                        console.log('重复了')

                        $scope.grid.configpost = false;
                        //$scope.grid.configno = true;
                    }
                }
                //console.log(i, ve);

            })
            angular.forEach($scope.configitems, function (item,i) {
                if (norepate) {
                    if (i != idx&&item.idx1 == $scope.configitems[idx].idx1) {
                        norepate = false;
                        console.log('重复了')
                        $scope.grid.configpost = false;
                        //$scope.grid.configno = true;
                    }
                }

            })
        }
    }
    $scope.rmconfigitem = function(idx){

        $scope.configitems.splice(idx,1);
        var norepate = true;
        var arr = [];
        angular.forEach($scope.configitems, function (item,i) {
            arr.push(item.idx1)
        });
        var arr = arr.concat($scope.configarr);
        console.log('arr111111', arr);
        var s = arr.join(",") +",";
        for(var i = 0; i < arr.length; i++)
        {
            if(s.replace(arr[i] + ",", "").indexOf(arr[i] +",") > -1)
            {
                norepate = false;
                console.log('重复了');
                $scope.grid.configpost = false;
            }
        }

        if (norepate) {
            //console.log($scope.configitems);
            console.log($scope.volume.data);
            angular.forEach($scope.configitems, function (item,i) {
                //var k = item.idx1;
                //var v = item.idx2;
                $scope.volume.data[item.idx1] = item.idx2;

            })
            console.log($scope.volume.data);
            $scope.volume.data.length++
            //$scope.volume.data[k] = v;

        }
        if($scope.configarr.length ==0 && $scope.configitems == 0){
            $scope.grid.configpost = false;
            //$scope.grid.configno = true;
        }

    }
    $scope.cearteconfig = function(){
        delete $scope.volume.data.length
        configmaps.create({namespace: $rootScope.namespace},$scope.volume , function (res) {
            console.log('createconfig----',res);
        })
    }
}])