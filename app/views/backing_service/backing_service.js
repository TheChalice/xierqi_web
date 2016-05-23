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

        angular.forEach(items, function (item) {

          if (condition.providerDisplayName === item.providerDisplayName) {
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
            arr[l].metadata.annotations.Class = arr[l].metadata.annotations.Class.toUpperCase()
            $scope.dev.push(arr[l].spec.metadata.providerDisplayName)
            $scope.cation.push(arr[l].metadata.annotations.Class)
          }
          $scope.dev = $scope.dev.unique()
          $scope.cation = $scope.cation.unique()
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
              if (arr[m].metadata.annotations.Class === $scope.cation[i]) {
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
          }
        } else {
          for (var k in $scope.test) {
            if (key == k) {
              $scope.test[k].isshow = true;
            } else {
              $scope.test[k].isshow = false;
            }
          }
        }
        $scope.grid[tp] = key;
        // filter(tp, key);
      };
      //第二栏筛选
      $scope.selectsc = function (tp, key) {
        for (var i = 0; i < $scope.cation.length; i++) {
          $scope.test[i].showTab = true
          $scope.isComplete = {providerDisplayName: $scope.dev[key]};
          //把渲染数组做二次筛选;
          var arr = $filter("myfilter")($scope.test[i].item, $scope.isComplete);
          if (arr.length == 0) {
            $scope.test[i].showTab = false
          }

        }
        console.log($scope.isComplete);
        if (key == $scope.grid[tp]) {
          key = 'all';
          $scope.isComplete = '';
          for (var k in $scope.test) {
            $scope.test[k].showTab = true;
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


      var loadBsi = function () {
        BackingServiceInstance.get({namespace: $rootScope.namespace}, function (res) {
          $log.info("backingServiceInstance", res);
          $scope.bsi = res;

          $scope.resourceVersion = res.metadata.resourceVersion;
          watchBsi($scope.resourceVersion);

        }, function (res) {
          //todo 错误处理
          $log.info("loadBsi err", res);
        });
      };
      loadBsi();

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
          Ws.clear();
          loadBsi();
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
          angular.forEach($scope.bsi.items, function (item, i) {
            if (item.metadata.name == data.object.metadata.name) {
              data.object.show = item.show;
              $scope.bsi.items[i] = data.object;
              $scope.$apply();
            }
          });
        }
      };

      $scope.search = function () {
        console.log("----", $scope.txt);
        filter('serviceCat', $scope.grid.serviceCat);
        filter('vendor', $scope.grid.vendor);
      };
      $scope.delBsi = function (idx) {
        $log.info('del$scope.bsi.items[idx]', $scope.bsi.items[idx]);
        if ($scope.bsi.items[idx].spec.binding) {
          var curlength = $scope.bsi.items[idx].spec.binding.length;
          if (curlength > 0) {
            Confirm.open('删除后端服务实例', '该实例已绑定服务,不能删除', '', '', true)
          } else {
            Confirm.open('删除后端服务实例', '您确定要删除该实例吗?此操作不可恢复', '', '', false).then(function () {
              BackingServiceInstance.del({
                namespace: $rootScope.namespace,
                name: $scope.bsi.items[idx].metadata.name
              }, function (res) {
                $scope.bsi.items.splice(idx, 1);
              }, function (res) {
                $log.info('err', res);
              })
            });

          }
        } else {
          Confirm.open('删除后端服务实例', '您确定要删除该实例吗?此操作不可恢复', '', '', false).then(function () {
            BackingServiceInstance.del({
              namespace: $rootScope.namespace,
              name: $scope.bsi.items[idx].metadata.name
            }, function (res) {
              $scope.bsi.items.splice(idx, 1);
            }, function (res) {
              $log.info('err', res);
            })
          });
        }


      }
      $scope.delBing = function (idx) {
        var name = $scope.bsi.items[idx].metadata.name;
        var bindings = [];
        var binds = $scope.bsi.items[idx].spec.binding || [];
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
          BackingServiceInstanceBd.put({namespace: $rootScope.namespace, name: name}, bindObj, function (res) {

          }, function (res) {
            //todo 错误处理
            Toast.open('操作失败');
            $log.info("del bindings err", res);
          });
        });
      };

      var bindService = function (name, dcs) {
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
          BackingServiceInstanceBd.create({namespace: $rootScope.namespace, name: name}, bindObj, function (res) {

          }, function (res) {
            //todo 错误处理
            Toast.open('操作失败');
            $log.info("bind services err", res);
          });
        }
      };
      $scope.bindModal = function (idx) {
        var bindings = $scope.bsi.items[idx].spec.binding || [];
        ServiceSelect.open(bindings).then(function (res) {
          $log.info("selected service", res);
          if (res.length > 0) {
            bindService($scope.bsi.items[idx].metadata.name, res);
          }
        });
      };
      // console.log($('.fw'))

      // (function () {
      //   var fw=document.getElementsByClassName('fw');
      //   console.log('fw',fw[1])
      //   for (var i = 0; i < fw.length; i++) {
      //     console.log(fw[i].innerText.length);
      //   }
      // })()

    }])