'use strict';
angular.module('console.backing_service', [
  {
    files: [
      'views/backing_service/backing_service.css',
      'components/bscard/bscard.js'
    ]
  }
]).filter('myfilter', function () {
      return function (items, condition) {
        var filtered = [];
        if (condition === undefined || condition === '') {
          return items;
        }
        if (condition.name === '') {
          return items;
        }
        if (condition.name) {
          for (var i = 0; i < items.length; i++) {
           var str = items[i].metadata.name.toLowerCase();
            if (str.indexOf(condition.name) != -1) {
              filtered.push(items[i]);
            }

          }
          return filtered;
          // angular.forEach(items, function (item) {
          //   var str = item.metadata.name.toLowerCase()
          //   // console.log(condition.name,str)
          //   if (str.indexOf(condition.name)!=-1) {
          //     filtered.push(item);
          //   }
          // });
          // console.log(filtered)
          // return filtered;
        }
        else {
          angular.forEach(items, function (item) {
            if (condition.providerDisplayName === item.providerDisplayName) {
              filtered.push(item);
            }
          });
          return filtered;
        }

      };
    }).filter('searchfilter', function () {
      return function (items, condition) {
        var filtered = [];

        if (condition === undefined || condition === '') {
          return items;
        }

        angular.forEach(items, function (item) {
          if (condition.name ==item.metadata.name) {
            filtered.push(item);
          }
        });

        return filtered;
      };
    })
    .controller('BackingServiceCtrl', ['$log', '$rootScope', '$scope', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'BackingServiceInstanceBd', 'Confirm', 'Toast', 'Ws', '$filter', function ($log, $rootScope, $scope, BackingService, BackingServiceInstance, ServiceSelect, BackingServiceInstanceBd, Confirm, Toast, Ws, $filter) {
      // 得到loadBs对象进行分组
      // 数组去重方法
      Array.prototype.unique = function () {
        this.sort(); //先排序
        var res = [this[0]];
        for (var i = 1; i < this.length; i++) {
          if (this[i] !== res[res.length - 1]) {
            res.push(this[i]);
          }
        }
        return res;
      }

      // 数组变对象

      var loadBs = function () {
        BackingService.get({namespace: 'openshift'}, function (data) {
          $log.info('loadBs', data);
          $scope.items = data.items;
          // console.log($scope.items);
          var arr = data.items;
          $scope.dev = [];
          $scope.cation = [];
          $scope.itemsDevop = [];
          $scope.isshow = {};
          $scope.showTab = {};
          //将类名变大写
          for (var l = 0; l < arr.length; l++) {
            if (arr[l].metadata.annotations && arr[l].metadata.annotations.Class !== undefined) {
              arr[l].metadata.annotations.Class = arr[l].metadata.annotations.Class.toUpperCase()
            } else {
              arr[l].metadata.annotations = {
                Class: '其他'
              };
            }
            $scope.dev.push(arr[l].spec.metadata.providerDisplayName)
            $scope.cation.push(arr[l].metadata.annotations.Class)
          }
          $scope.dev = $scope.dev.unique()

          $scope.cation = $scope.cation.unique()
          $scope.cation.reverse()
          // var cation = $scope.cation[3];
          // $scope.cation.splice(3,1)
          // console.log($scope.cation);
          // $scope.cation.unshift(cation)
          // $scope.others = [];
          //服务分类属性
          // console.log(arr[0].metadata.annotations.Class)
          // 服务提供者属性
          // console.log(arr[1].spec.metadata.providerDisplayName)
          //服务提供者分组
          //
          for (var j = 0; j < arr.length; j++) {
            // console.log(arr[j].spec.metadata.providerDisplayName)
            // $scope.cation.push(arr[j].metadata.annotations.Class)
            for (var b = 0; b < $scope.dev.length; b++) {
              if (arr[j].spec.metadata.providerDisplayName === $scope.dev[b]) {
                arr[j].providerDisplayName = $scope.dev[b];
              }
            }
            // console.log(arr[j].providerDisplayName)
          }
          // console.log('$scope.dev', $scope.dev);
          // console.log('$scope.cation', $scope.cation);

          // console.log('change', arr)
          //服务分类分组

          for (var i = 0; i < $scope.cation.length; i++) {
            // console.log('change', arr[i].providerDisplayName)
            $scope.itemsDevop.push([])
            for (var m = 0; m < arr.length; m++) {
              if (arr[m].metadata.annotations && arr[m].metadata.annotations.Class === $scope.cation[i]) {
                $scope.itemsDevop[i].push(arr[m]);
              }
            }
            $scope.isshow[i] = true;
            $scope.showTab[i] = true;

          }
          // console.log("$scope.itemsDevop", $scope.itemsDevop)
          // console.log("$scope.isshow", $scope.isshow)
          // 设置渲染到页面的数据
          $scope.test = [];
          for (var s = 0; s < $scope.cation.length; s++) {
            $scope.test.push({})
            $scope.test[s].name = $scope.cation[s];
            for (var q = 0; q < $scope.itemsDevop.length; q++) {
              if (s == q) {
                $scope.test[s].item = $scope.itemsDevop[q]
                $scope.test[s].isshow = $scope.isshow[q]
                $scope.test[s].showTab = $scope.showTab[q]
                $scope.test[s].id = q;
              }
            }
          }

          var other=null;
          for (var o = 0; o < $scope.test.length; o++) {
            if ($scope.test[o].name == '其他') {
              other = $scope.test[o];
              $scope.test.splice(o,1);
            }
          }
          $scope.test.sort(function (x, y) {
            return x.item.length > y.item.length ? -1 : 1;
          });
          
          if (other) {
            $scope.test.push(other)
          }
          // console.log($scope.test)

          var lins = [];
          for (var x = 0; x <$scope.test.length; x++) {
            lins.push($scope.test[x].name)
          }
          $scope.cation=lins;
          // console.log(lins);
          // 第一栏分类
          var fiftobj = {};
          var fiftmanobj = {}
          for (var q = 0; q < data.items.length; q++) {
            fiftobj[data.items[q].metadata.name] = data.items[q].metadata.annotations.Class
            fiftmanobj[data.items[q].metadata.name] = data.items[q].providerDisplayName
          }
          // console.log('fiftobj',fiftobj)
          // console.log('fiftmanobj',fiftmanobj)


          //我的后端服务json
          var loadBsi = function () {
            BackingServiceInstance.get({namespace: $rootScope.namespace}, function (res) {
              $log.info("backingServiceInstance", res);
              $scope.resourceVersion = res.metadata.resourceVersion;
              watchBsi($scope.resourceVersion);
              $scope.bsi = res;
              for (var i = 0; i < res.items.length; i++) {
                for (var k in fiftobj) {
                  if (res.items[i].spec.provisioning.backingservice_name == k) {
                    res.items[i].type = fiftobj[k];
                  }
                }
                for (var w in fiftmanobj) {
                  if (res.items[i].spec.provisioning.backingservice_name == w) {
                    res.items[i].providerDisplayName = fiftmanobj[w];
                  }
                }
                //console.log(res.items[i].spec.provisioning.backingservice_name)
              }
              var fiftarr = [];

              for (var r = 0; r < $scope.cation.length; r++) {
                fiftarr.push([]);
                for (var m = 0; m < res.items.length; m++) {
                  if (res.items[m].type && res.items[m].type === $scope.cation[r]) {
                    fiftarr[r].push(res.items[m]);
                  }
                }
              }
              $scope.mytest = [];
              for (var s = 0; s < $scope.cation.length; s++) {
                $scope.mytest.push({})
                $scope.mytest[s].name = $scope.cation[s];
                for (var q = 0; q < fiftarr.length; q++) {
                  if (s == q) {
                    $scope.mytest[s].item = fiftarr[q]
                    $scope.mytest[s].isshow = true;
                    $scope.mytest[s].showTab = true;
                    $scope.mytest[s].id = q;
                  }
                }
              }
              // console.log('$scope.mytest');
              for (var d = 0; d < $scope.cation.length; d++) {
                var arr1 = $filter("myfilter")($scope.mytest[d].item, $scope.isComplete);
                if (arr1.length == 0) {
                  $scope.mytest[d].showTab = false
                }
              }
              // console.log('mytest', $scope.mytest)
            }, function (res) {
              //todo 错误处理
              $log.info("loadBsi err", res);
            });

          };
          loadBsi();

          for (var r = 0; r < $scope.test.length; r++) {
            for (var u = 0; u < $scope.test[r].item.length; u++) {
              // console.log($scope.test[r].item[u].status.phase);
              if ($scope.test[r].item[u].status.phase === 'Active') {
                $scope.test[r].item[u].biancheng = true;
              }else {
                $scope.test[r].item[u].bianhui = true;
              }
              
            }
          }
          console.log("$scope.test", $scope.test)
          $scope.data = data.items;
          filter('serviceCat', 'all');
          filter('vendor', 'all');

        })
      };
      loadBs();

      $scope.status = {};

      $scope.grid = {
        serviceCat: 'all',
        vendor: 'all',
        txt: ''
      };
      $scope.isComplete = '';

      // 第一栏筛选
      $scope.select = function (tp, key) {
        // console.log("tp", tp, 'key', $scope.cation[key]);
        //class判定
        if (key == $scope.grid[tp]) {
          key = 'all';
          for (var k in $scope.test) {
            $scope.test[k].isshow = true;
            $scope.mytest[k].isshow = true;
          }
        } else {
          for (var k in $scope.test) {
            if (key == k) {
              $scope.test[k].isshow = true;
              $scope.mytest[k].isshow = true;
            } else {
              $scope.test[k].isshow = false;
              $scope.mytest[k].isshow = false;
            }
          }
        }
        $scope.grid[tp] = key;
        // filter(tp, key);
      };
      //第二栏筛选

      $scope.selectsc = function (tp, key) {
        for (var i = 0; i < $scope.cation.length; i++) {
          $scope.test[i].showTab = true;
          $scope.mytest[i].showTab = true;
          $scope.isComplete = {providerDisplayName: $scope.dev[key]};
          //把渲染数组做二次筛选;
          var arr = $filter("myfilter")($scope.test[i].item, $scope.isComplete);
          if (arr.length == 0) {
            $scope.test[i].showTab = false
          }
          var arr1 = $filter("myfilter")($scope.mytest[i].item, $scope.isComplete);
          if (arr1.length == 0) {
            $scope.mytest[i].showTab = false
          }

        }
        // console.log($scope.isComplete);
        if (key == $scope.grid[tp]) {
          key = 'all';
          $scope.isComplete = '';

          for (var k in $scope.test) {
            $scope.test[k].showTab = true;
            $scope.mytest[k].showTab = true;
          }
          for (var d = 0; d < $scope.cation.length; d++) {
            var arr1 = $filter("myfilter")($scope.mytest[d].item, $scope.isComplete);
            if (arr1.length == 0) {
              $scope.mytest[d].showTab = false
            }
          }
        }
        $scope.grid[tp] = key;
        // console.log("$scope.itemsDevop", $scope.itemsDevop)
      }


      var filter = function (tp, key) {
        var reg = null;
        if ($scope.grid.txt) {
          var txt = $scope.grid.txt.replace(/\//g, '\\/');
          reg = eval('/' + txt + '/ig');
        }
        angular.forEach($scope.items, function (item) {
          if (tp == 'serviceCat') {
            item.show = item.metadata.labels.cat == key || key == 'all';
          }
          if (tp == 'vendor') {
            item.show = item.spec.metadata.providerDisplayName == key || key == 'all';
          }
          if (reg) {
            item.show = item.show && reg.test(item.metadata.name)
          }
        });
      };

      var newid = null;
      var watchBsi = function (resourceVersion) {
        Ws.watch({
          resourceVersion: resourceVersion,
          namespace: $rootScope.namespace,
          type: 'backingserviceinstances',
          name: ''
        }, function (res) {
          var data = JSON.parse(res.data);
          $scope.resourceVersion = data.object.metadata.resourceVersion;
          updateBsi(data);
        }, function () {
          $log.info("webSocket start");
        }, function () {
          $log.info("webSocket stop");
          var key = Ws.key($rootScope.namespace, 'backingserviceinstances', '');
          if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
            return;
          }
          watchBsi($scope.resourceVersion);
        });
      };

      var updateBsi = function (data) {
        $log.info("watch bsi", data);

        if (data.type == 'ERROR') {
          $log.info("err", data.object.message);
          // loadBsi();
          Ws.clear();

          return;
        }

        $scope.resourceVersion = data.object.metadata.resourceVersion;

        if (data.type == 'ADDED') {
          data.object.showLog = true;
          if ($scope.bsi.items.length > 0) {
            $scope.bsi.items.unshift(data.object);
          } else {
            $scope.bsi.items = [data.object];
          }
        } else if (data.type == "MODIFIED") {

          // console.log('newid',newid)
          if ($scope.mytest[newid]) {
            angular.forEach($scope.mytest[newid].item, function (item, i) {
              if (item.metadata.name == data.object.metadata.name) {
                data.object.show = item.show;
                $scope.mytest[newid].item[i] = data.object;
                $scope.$apply();
              }
            })
            // console.log('$scope.mytest[newid].item',$scope.mytest[newid].item.length)
            if ($scope.mytest[newid].item.length == '0') {
              $scope.mytest[newid].showTab = false;
              $scope.$apply();
            }
          }
        }
      };

      $scope.keysearch=function (event) {
        if (event.keyCode === 13) {
          $scope.isComplete={name:$scope.grid.txt};
          var sarr = [];
          if ($scope.grid.txt) {
            for (var s = 0; s < $scope.test.length; s++) {
              sarr = $filter("myfilter")($scope.test[s].item, $scope.isComplete);
              // console.log(sarr.length)
              if (sarr.length === 0) {
                $scope.test[s].showTab = false;
              }
            }
          }else {
            for (var s = 0; s < $scope.test.length; s++) {
              sarr = $filter("myfilter")($scope.test[s].item, $scope.isComplete);
              console.log(sarr.length)
              $scope.test[s].showTab=true;
            }
            }
        }
      }
      // 搜索
      $scope.search = function () {
        $scope.isComplete={name:$scope.grid.txt};
        var sarr = [];
        if ($scope.grid.txt) {
          for (var s = 0; s < $scope.test.length; s++) {
            sarr = $filter("myfilter")($scope.test[s].item, $scope.isComplete);
            if (sarr.length === 0) {
              $scope.test[s].showTab = false;
            }
          }
        }else {
          for (var s = 0; s < $scope.test.length; s++) {
              sarr = $filter("myfilter")($scope.test[s].item, $scope.isComplete);
              console.log(sarr.length)
              $scope.test[s].showTab=true;
            }
        }
        console.log($scope.test);
        // filter('serviceCat', $scope.grid.serviceCat);
        // filter('vendor', $scope.grid.vendor);
      };

      $scope.delBsi = function (idx, id) {
        newid=id;
        // console.log('del$scope.mytest[id].item[idx]', $scope.mytest[id].item[idx].spec.binding);
        if ($scope.mytest[id].item[idx].spec.binding) {
          var curlength = $scope.mytest[id].item[idx].spec.binding.length;
          if (curlength > 0) {
            Confirm.open('删除后端服务实例', '该实例已绑定服务,不能删除', '', '', true)
          } else {
            Confirm.open('删除后端服务实例', '您确定要删除该实例吗?此操作不可恢复', '', '', false).then(function () {
              BackingServiceInstance.del({
                namespace: $rootScope.namespace,
                name: $scope.mytest[id].item[idx].metadata.name
              }, function (res) {
                $scope.mytest[id].item.splice(idx, 1);
              }, function (res) {
                $log.info('err', res);
              })
            });

          }
        } else {
          Confirm.open('删除后端服务实例', '您确定要删除该实例吗?此操作不可恢复', '', '', false).then(function () {
            BackingServiceInstance.del({
              namespace: $rootScope.namespace,
              name: $scope.mytest[id].item[idx].metadata.name
            }, function (res) {
              $scope.mytest[id].item.splice(idx, 1);
            }, function (res) {
              $log.info('err', res);
            })
          });
        }


      }
      $scope.delBing = function (idx, id) {
        newid = id;
        var name = $scope.mytest[id].item[idx].metadata.name;
        var bindings = [];
        var binds = $scope.mytest[id].item[idx].spec.binding || [];
        for (var i = 0; i < binds.length; i++) {
          if (binds[i].checked) {
            bindings.push(binds[i]);
          }
        }
        if (bindings.length == 0) {
          Toast.open('请先选择要解除绑定的服务');
          return;
        }

        angular.forEach(bindings, function (binding) {
          var bindObj = {
            metadata: {
              name: name
            },
            resourceName: binding.bind_deploymentconfig,
            bindResourceVersion: '',
            bindKind: 'DeploymentConfig'
          };
          // console.log(bindObj)
          BackingServiceInstanceBd.put({namespace: $rootScope.namespace, name: name},
              bindObj, function (res) {
                // console.log('解绑定', res)
              }, function (res) {
                //todo 错误处理
                // Toast.open('操作失败');
                if (res.data.message.split(':')[1]) {
                  Toast.open(res.data.message.split(':')[1].split(';')[0]);
                }else {
                  Toast.open(res.data.message);
                }
                $log.info("del bindings err", res);
              });
        });
      };

      var bindService = function (name, dcs, idx, id) {

        var bindObj = {
          metadata: {
            name: name
          },
          resourceName: '',
          bindResourceVersion: '',
          bindKind: 'DeploymentConfig'
        };
        for (var i = 0; i < dcs.length; i++) {
          bindObj.resourceName = dcs[i].metadata.name;
          BackingServiceInstanceBd.create({namespace: $rootScope.namespace, name: name}, bindObj,
              function (res) {
              }, function (res) {
                //todo 错误处理
                // Toast.open('操作失败');
                if (res.data.message.split(':')[1]) {
                  Toast.open(res.data.message.split(':')[1].split(';')[0]);
                }else {
                  Toast.open(res.data.message);
                }
                
                $log.info("bind services " +
                    "err", res);
              });
        }
      };
      $scope.bindModal = function (idx, id) {
        newid = id;
        var bindings = $scope.mytest[id].item[idx].spec.binding || [];
        ServiceSelect.open(bindings).then(function (res) {
          $log.info("selected service", res);
          if (res.length > 0) {
            bindService($scope.mytest[id].item[idx].metadata.name, res, idx, id);
          }
        });
      };


    }])