'use strict';
angular.module('console.image', [
      {
        files: [
          'components/searchbar/searchbar.js',
          'components/card/card.js',
          'views/image/image.css'
        ]
      }
    ])
    .controller('ImageCtrl', ['$state','$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort',
      function ($state,$q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
        // 数组去重
        console.log('$state',$state.params.index);
        if ($state.params.index) {
          $scope.check = $state.params.index
        }else {
          $scope.check = false
        }
        Array.prototype.unique = function () {
          var res = [this[0]];
          for (var i = 1; i < this.length; i++) {
            var repeat = false;
            for (var j = 0; j < res.length; j++) {
              if (this[i] == res[j]) {
                repeat = true;
                break;
              }
            }
            if (!repeat) {
              res.push(this[i]);
            }
          }
          return res;
        }
        // 分页对象
        $scope.grid = {
          page: 1,
          size: 8,
          copytest: {}
        };
        // 存储commit id 和 分支,angular修改数组内元素属性不能触发刷新
        $scope.gitStore = {};
        // 监视分页的页数控制换页
        $scope.$watch('grid.page', function (newVal, oldVal) {
          if (newVal != oldVal) {
            refresh(newVal);
          }
        });
        // 控制换页方法
        var refresh = function (page) {
          var skip = (page - 1) * $scope.grid.size;
          $scope.testlist = $scope.testcopy.slice(skip, skip + $scope.grid.size);
          $scope.grid.total = $scope.testcopy.length;
        };


        $scope.fyshow = true;
        // 在searchbar组件中调用
        $scope.doSearch = function (txt) {
          // 使搜索框失去焦点
          $scope.showTip = false;
          $scope.search(txt);
        }
        // 私有镜像平台键盘搜索
        $scope.search = function (key, txt) {
          if (!txt) {
            refresh(1);
            $scope.fyshow = true;
            return;
          }
          $scope.items = [];
          txt = txt.replace(/\//g, '\\/');
          var reg = eval('/' + txt + '/');
          for (var i = 0; i < $scope.data.items.length; i++) {
            if (reg.test($scope.data.items[i].metadata.name)) {
              $scope.items.push($scope.data.items[i]);
            }
          }
          $scope.grid.total = $scope.items.length;
          if ($scope.grid.page == 1) {
            $scope.fyshow = false;
          }
        };
        // 控制collapse Class使列表展开或闭合
        $scope.opened = true;
        // 平台公有镜像键盘搜索
        $scope.ksearch = function (key, txt, event) {
          if (event.keyCode == 13) {
            if (!txt) {
              // console.log($scope.grid.copytest)
              $scope.newtext = $scope.grid.copytest;
              console.log($scope.newtext)
              $scope.opened = true;
              return;
            }
            var namelist = [];
            txt = txt.replace(/\//g, '\\/');
            $http.get('/registry/api/search',
                {params: {q: txt}})
                .success(function (data) {
                  console.log(data);
                  for (var i = 0; i < data.repository.length; i++) {
                    // console.log(data.repository[i].project_name);
                    namelist.push(data.repository[i].project_name)
                  }
                  namelist = namelist.unique();
                  var item = [];
                  for (var j = 0; j < namelist.length; j++) {
                    item.push({name: namelist[j], items: []});
                    for (var k = 0; k < data.repository.length; k++) {
                      if (namelist[j] === data.repository[k].project_name) {
                        item[j].items.push(data.repository[k].repository_name);
                      }
                    }
                  }

                  for (var q = 0; q < $scope.grid.copytest.length; q++) {
                    for (var r = 0; r < item.length; r++) {
                      if (item[r].name === $scope.grid.copytest[q].name) {
                        item[r].creation_time = $scope.grid.copytest[q].creation_time;
                        item[r].mysort = $scope.grid.copytest[q].mysort;
                      }
                    }
                  }
                  item.sort(function (x, y) {
                    return x.mysort > y.mysort ? -1 : 1;
                  });

                  if (item[0].name) {
                    // console.log(item);
                    $scope.newtext = item;
                    $scope.opened = false;
                  } else {
                    $scope.test = null;
                  }

                })
          }
        }

        $http.get('/oapi/v1/namespaces/' + $rootScope.namespace + '/imagestreams')
            .success(function (datalist) {
              $scope.testlist = datalist.items;
              $scope.testcopy = angular.copy(datalist.items)
              $scope.grid.total = $scope.testcopy.length;
              // console.log('$scope.testcopy', $scope.testcopy)
              refresh(1)
              // console.log('$scope.testlist',$scope.testlist)
            })
        // 平台公有镜像搜索
        $scope.gsearch = function (key, txt) {
          if (event.keyCode == 13) {
            if (!txt) {
              // console.log($scope.grid.copytest)
              $scope.newtext = $scope.grid.copytest;
              console.log($scope.newtext)
              $scope.opened = true;
              return;
            }
            var namelist = [];
            txt = txt.replace(/\//g, '\\/');
            $http.get('/registry/api/search',
                {params: {q: txt}})
                .success(function (data) {
                  console.log(data);
                  for (var i = 0; i < data.repository.length; i++) {
                    // console.log(data.repository[i].project_name);
                    namelist.push(data.repository[i].project_name)
                  }
                  namelist = namelist.unique();
                  var item = [];
                  for (var j = 0; j < namelist.length; j++) {
                    item.push({name: namelist[j], items: []});
                    for (var k = 0; k < data.repository.length; k++) {
                      if (namelist[j] === data.repository[k].project_name) {
                        item[j].items.push(data.repository[k].repository_name);
                      }
                    }
                  }

                  for (var q = 0; q < $scope.grid.copytest.length; q++) {
                    for (var r = 0; r < item.length; r++) {
                      if (item[r].name === $scope.grid.copytest[q].name) {
                        item[r].creation_time = $scope.grid.copytest[q].creation_time;
                        item[r].mysort = $scope.grid.copytest[q].mysort;
                      }
                    }
                  }
                  item.sort(function (x, y) {
                    return x.mysort > y.mysort ? -1 : 1;
                  });

                  if (item[0].name) {
                    // console.log(item);
                    $scope.newtext = item;
                    $scope.opened = false;
                  } else {
                    $scope.test = null;
                  }

                })
          }
        }
        // 请求共有镜像平台
        $http.get('/registry/api/projects', {
          params: {is_public: 0}
        }).success(function (data) {
          $scope.newtext = data;

          console.log('regstr',data);

          var arr = [];

          //for (var i = 0; i < data.length; i++) {
          //  data[i].mysort = data[i].creation_time;
          //  data[i].mysort = (new Date(data[i].mysort)).getTime()
          //}
          ////时间冒泡排序写法
          //data.sort(function (x, y) {
          //  return x.mysort > y.mysort ? -1 : 1;
          //});

          for (var j = 0; j < $scope.newtext.length; j++) {
            // 请求共有镜像平台的镜像版本
            $http.get('/registry/api/repositories', {params: {project_id: $scope.newtext[j].project_id}})
                .success(function (datalis) {
                  arr.push(datalis);

                  if (arr.length == data.length) {
                      console.log('newtext',arr);

                      for (var k = 0; k < arr.length; k++) {

                      if (arr[k] != null) {
                        for (var h = 0; h < $scope.newtext.length; h++) {

                          if (arr[k][0].split('/')[0] == $scope.newtext[h].name) {

                            $scope.newtext[h].items = arr[k];
                            $scope.newtext[h].isshow = true;
                          }
                        }
                      }
                    }
                  }

                  $scope.grid.copytest = angular.copy($scope.newtext);

                }).error(function (msg) {
              //TODO:失败时错误处理
            })
          }
        }).error(function (data) {
          // $log.info('error',data)
          //$rootScope.user = null;
          // console.log('error', $rootScope)
        });

      }]);
