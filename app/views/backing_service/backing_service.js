'use strict';
angular.module('console.backing_service', [
  {
    files: [
      'views/backing_service/backing_service.css',
      'components/bscard/bscard.js'
    ]
  }
])
    .filter('myfilter', function () {
      // 分类过滤器
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
    })
    .controller('BackingServiceCtrl', ['$log', '$rootScope', '$scope', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'BackingServiceInstanceBd', 'Confirm', 'Toast', 'Ws', '$filter',
      function ($log, $rootScope, $scope, BackingService, BackingServiceInstance, ServiceSelect, BackingServiceInstanceBd, Confirm, Toast, Ws, $filter) {
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
      // 得到loadBs对象进行分组
      var loadBs = function () {
        BackingService.get({namespace: 'openshift'}, function (data) {
          $log.info('loadBs', data);
          $scope.items = data.items;
          var arr = data.items;
          //上方两个tab分组数组
          //服务分类
          $scope.cation = [];
         // 服务提供者
          $scope.providers = [];
          // 每个item中有几个对象
          $scope.itemsDevop = [];
          //将类名变大写
          for (var l = 0; l < arr.length; l++) {
            if (arr[l].metadata.annotations && arr[l].metadata.annotations.Class !== undefined) {
              arr[l].metadata.annotations.Class = arr[l].metadata.annotations.Class.toUpperCase()
            } else {
              arr[l].metadata.annotations = {
                Class: '其他'
              };
            }
            if (!arr[l].spec.metadata.providerDisplayName) {
              arr[l].spec.metadata.providerDisplayName='其他'
            }
            $scope.providers.push(arr[l].spec.metadata.providerDisplayName)
            $scope.cation.push(arr[l].metadata.annotations.Class)
          }
          //将分类去重
          $scope.cation = $scope.cation.unique()
          $scope.providers = $scope.providers.unique()
          //服务分类属性
          // item.metadata.annotations.Class
          // 服务提供者属性
          // item.spec.metadata.providerDisplayName
          //服务提供者分组
          for (var j = 0; j < arr.length; j++) {

            for (var b = 0; b < $scope.providers.length; b++) {
              if (arr[j].spec.metadata.providerDisplayName === $scope.providers[b]) {
                arr[j].providerDisplayName = $scope.providers[b];
              }
            }
          }
          //服务分类分组
          for (var i = 0; i < $scope.cation.length; i++) {
            $scope.itemsDevop.push([])
            for (var m = 0; m < arr.length; m++) {
              if (arr[m].metadata.annotations && arr[m].metadata.annotations.Class === $scope.cation[i]) {
                $scope.itemsDevop[i].push(arr[m]);
              }
            }
          }
          // 设置渲染到页面的数据market市场
          $scope.market = [];
          for (var s = 0; s < $scope.cation.length; s++) {
            $scope.market.push({})
            $scope.market[s].name = $scope.cation[s];
            for (var q = 0; q < $scope.itemsDevop.length; q++) {
              if (s == q) {
                $scope.market[s].item = $scope.itemsDevop[q]
                $scope.market[s].isshow = true;
                $scope.market[s].showTab = true;
                $scope.market[s].id = q;
              }
            }
          }
          // 划分出market的其他分类
          var other=null;
          for (var o = 0; o < $scope.market.length; o++) {
            if ($scope.market[o].name == '其他') {
              other = $scope.market[o];
              $scope.market.splice(o,1);
            }
          }
          // 把market根据item多少进行排序
          $scope.market.sort(function (x, y) {
            return x.item.length > y.item.length ? -1 : 1;
          });
          // 如果有other把other放到最后
          if (other) {
            $scope.market.push(other)
          }
          // 从新将服务分类提取
          var lins = [];
          for (var x = 0; x <$scope.market.length; x++) {
            lins.push($scope.market[x].name)
          }
          // 将上面的服务分类顺序排列的与下方一致
          $scope.cation=lins;
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
              //我的后端服务页面渲染json
              $scope.myservice = [];
              for (var s = 0; s < $scope.cation.length; s++) {
                $scope.myservice.push({})
                $scope.myservice[s].name = $scope.cation[s];
                for (var q = 0; q < fiftarr.length; q++) {
                  if (s == q) {
                    $scope.myservice[s].item = fiftarr[q]
                    $scope.myservice[s].isshow = true;
                    $scope.myservice[s].showTab = true;
                    $scope.myservice[s].id = q;
                  }
                }
              }
              // console.log('$scope.myservice');
              for (var d = 0; d < $scope.cation.length; d++) {
                var arr1 = $filter("myfilter")($scope.myservice[d].item, $scope.isComplete);
                if (arr1.length == 0) {
                  $scope.myservice[d].showTab = false
                }
              }
              // console.log('mytest', $scope.myservice)
            }, function (res) {
              //todo 错误处理
              $log.info("loadBsi err", res);
            });

          };
          loadBsi();

          for (var r = 0; r < $scope.market.length; r++) {
            for (var u = 0; u < $scope.market[r].item.length; u++) {
              // console.log($scope.market[r].item[u].status.phase);
              if ($scope.market[r].item[u].status.phase === 'Active') {
                $scope.market[r].item[u].biancheng = true;
              }else {
                $scope.market[r].item[u].bianhui = true;
              }

            }
          }
          console.log("$scope.market", $scope.market)
          $scope.data = data.items;
          filter('serviceCat', 'all');
          filter('vendor', 'all');

        })
      };
      loadBs();
      $scope.status = {};
      //页面双向绑定数据
      $scope.grid = {
        serviceCat: 'all',
        vendor: 'all',
        txt: '',
        mytxt:''
      };
      //tab切换分类过滤对象
      $scope.isComplete = '';
      //服务分类筛选
      $scope.select = function (tp, key) {
        // console.log("tp", tp, 'key', $scope.cation[key]);
        //class判定
        if (key == $scope.grid[tp]) {
          key = 'all';
          for (var k in $scope.market) {
            $scope.market[k].isshow = true;
            $scope.myservice[k].isshow = true;
          }
        } else {
          for (var k in $scope.market) {
            if (key == k) {
              $scope.market[k].isshow = true;
              $scope.myservice[k].isshow = true;
            } else {
              $scope.market[k].isshow = false;
              $scope.myservice[k].isshow = false;
            }
          }
        }
        $scope.grid[tp] = key;
        // filter(tp, key);
      };
      //服务提供者筛选
      $scope.selectsc = function (tp, key) {
        for (var i = 0; i < $scope.cation.length; i++) {
          $scope.market[i].showTab = true;
          $scope.myservice[i].showTab = true;
          $scope.isComplete = {providerDisplayName: $scope.providers[key]};
          //把渲染数组做二次筛选;
          var arr = $filter("myfilter")($scope.market[i].item, $scope.isComplete);
          if (arr.length == 0) {
            $scope.market[i].showTab = false
          }
          var arr1 = $filter("myfilter")($scope.myservice[i].item, $scope.isComplete);
          if (arr1.length == 0) {
            $scope.myservice[i].showTab = false
          }

        }
        // console.log($scope.isComplete);
        if (key == $scope.grid[tp]) {
          key = 'all';
          $scope.isComplete = '';

          for (var k in $scope.market) {
            $scope.market[k].showTab = true;
            $scope.myservice[k].showTab = true;
          }
          for (var d = 0; d < $scope.cation.length; d++) {
            var arr1 = $filter("myfilter")($scope.myservice[d].item, $scope.isComplete);
            if (arr1.length == 0) {
              $scope.myservice[d].showTab = false
            }
          }
        }
        $scope.grid[tp] = key;
        // console.log("$scope.itemsDevop", $scope.itemsDevop)
      }
      // 正则方式过滤器
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
      // 我的后端服务长连接
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
      // 我的后端服务长连接监视方法
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
          if ($scope.myservice[newid]) {
            angular.forEach($scope.myservice[newid].item, function (item, i) {
              if (item.metadata.name == data.object.metadata.name) {
                data.object.show = item.show;
                $scope.myservice[newid].item[i] = data.object;
                $scope.$apply();
              }
            })
            // console.log('$scope.myservice[newid].item',$scope.myservice[newid].item.length)
            if ($scope.myservice[newid].item.length == '0') {
              $scope.myservice[newid].showTab = false;
              $scope.$apply();
            }
          }
        }
      };
      // 我的后端服务键盘搜索
      $scope.mykeysearch=function (event) {

        if (event.keyCode === 13){
          for (var s = 0; s < $scope.myservice.length; s++) {
            $scope.myservice[s].showTab=true;
          }
          $scope.isComplete={name:$scope.grid.mytxt};
          var sarr = [];
          if ($scope.grid.mytxt) {
            for (var s = 0; s < $scope.myservice.length; s++) {
              sarr = $filter("myfilter")($scope.myservice[s].item, $scope.isComplete);
              if (sarr.length === 0) {
                $scope.myservice[s].showTab = false;
              }
            }
          }else {
            for (var s = 0; s < $scope.myservice.length; s++) {
              sarr = $filter("myfilter")($scope.myservice[s].item, $scope.isComplete);
              // console.log(sarr.length)
              if (sarr.length === 0) {
                $scope.myservice[s].showTab = false;
              }else {
                $scope.myservice[s].showTab=true;
              }
            }
          }
        }
      }
      //服务分类键盘搜索
      $scope.keysearch=function (event) {
        if (event.keyCode === 13) {
          for (var s = 0; s < $scope.market.length; s++) {
            $scope.market[s].showTab=true;
          }
          $scope.isComplete={name:$scope.grid.txt};
          var sarr = [];
          if ($scope.grid.txt) {
            for (var s = 0; s < $scope.market.length; s++) {
              sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
              // console.log(sarr.length)
              if (sarr.length === 0) {
                $scope.market[s].showTab = false;
              }
            }
          }else {
            for (var s = 0; s < $scope.market.length; s++) {
              sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
              $scope.market[s].showTab=true;
            }
            }
        }
      }
      // 我的后端服务搜索
      $scope.mysearch=function () {
        for (var s = 0; s < $scope.myservice.length; s++) {
          $scope.myservice[s].showTab=true;
        }
        $scope.isComplete={name:$scope.grid.mytxt};
        var sarr = [];
        for (var s = 0; s < $scope.myservice.length; s++) {
          $scope.myservice[s].showTab=true;
        }
        if ($scope.grid.mytxt) {
          for (var s = 0; s < $scope.myservice.length; s++) {
            sarr = $filter("myfilter")($scope.myservice[s].item, $scope.isComplete);
            if (sarr.length === 0) {
              $scope.myservice[s].showTab = false;
            }
          }
        }else {
          for (var s = 0; s < $scope.myservice.length; s++) {
            sarr = $filter("myfilter")($scope.myservice[s].item, $scope.isComplete);
            // console.log(sarr.length)
            if (sarr.length === 0) {
              $scope.myservice[s].showTab = false;
            }else {
              $scope.myservice[s].showTab=true;
            }
          }
        }
        // console.log($scope.myservice);
        // filter('serviceCat', $scope.grid.serviceCat);
        // filter('vendor', $scope.grid.vendor);
      }
      //服务分类搜索
      $scope.search = function () {
        $scope.isComplete={name:$scope.grid.txt};
        for (var s = 0; s < $scope.market.length; s++) {
          $scope.market[s].showTab=true;
        }
        var sarr = [];
        if ($scope.grid.txt) {
          for (var s = 0; s < $scope.market.length; s++) {
            sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete);
            if (sarr.length === 0) {
              $scope.market[s].showTab = false;
            }
          }
        }else {
          for (var s = 0; s < $scope.market.length; s++) {
              sarr = $filter("myfilter")($scope.market[s].item, $scope.isComplete)
              $scope.market[s].showTab=true;
            }
        }
        // console.log($scope.market);
        // filter('serviceCat', $scope.grid.serviceCat);
        // filter('vendor', $scope.grid.vendor);
      };
      //我的后端服务删除一个实例
      var newid = null;
      $scope.delBsi = function (idx, id) {
        newid=id;
        // console.log('del$scope.myservice[id].item[idx]', $scope.myservice[id].item[idx].spec.binding);
        if ($scope.myservice[id].item[idx].spec.binding) {
          var curlength = $scope.myservice[id].item[idx].spec.binding.length;
          if (curlength > 0) {
            Confirm.open('删除后端服务实例', '该实例已绑定服务，不能删除', '', '', true)
          } else {
            Confirm.open('删除后端服务实例', '您确定要删除该实例吗？此操作不可恢复', '', '', false).then(function () {
              BackingServiceInstance.del({
                namespace: $rootScope.namespace,
                name: $scope.myservice[id].item[idx].metadata.name
              }, function (res) {
                $scope.myservice[id].item.splice(idx, 1);
                Toast.open('删除成功');
              }, function (res) {
                $log.info('err', res);
              })
            });
          }
        } else {
          Confirm.open('删除后端服务实例', '您确定要删除该实例吗？此操作不可恢复', '', '', false).then(function () {
            BackingServiceInstance.del({
              namespace: $rootScope.namespace,
              name: $scope.myservice[id].item[idx].metadata.name
            }, function (res) {
              $scope.myservice[id].item.splice(idx, 1);
              Toast.open('删除成功');
            }, function (res) {
              $log.info('err', res);
            })
          });
        }


      }
      //我的后端服务解除绑定一个服务
      $scope.delBing = function (idx, id) {
        newid = id;
        var name = $scope.myservice[id].item[idx].metadata.name;
        var bindings = [];
        var binds = $scope.myservice[id].item[idx].spec.binding || [];
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
              name: name,
              annotations : {
                "dadafoundry.io/create-by" : $rootScope.user.metadata.name
              }
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
      //我的后端服务绑定一个服务
      var bindService = function (name, dcs, idx, id) {
        var bindObj = {
          metadata: {
            name: name,
            annotations : {
              "dadafoundry.io/create-by" : $rootScope.user.metadata.name
            }
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
        var bindings = $scope.myservice[id].item[idx].spec.binding || [];
        ServiceSelect.open(bindings).then(function (res) {
          $log.info("selected service", res);
          if (res.length > 0) {
            bindService($scope.myservice[id].item[idx].metadata.name, res, idx, id);
          }
        });
      };
    }])