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
    .controller('ImageCtrl', ['$q', '$http', 'platform', '$rootScope', '$scope', '$log', 'ImageStreamTag', 'BuildConfig', 'Build', 'GLOBAL', 'Sort', function ($q, $http, platform, $rootScope, $scope, $log, ImageStreamTag, BuildConfig, Build, GLOBAL, Sort) {
      // platform.query({id:5},function(data) {
      //   console.log("platform", data)
      // });
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
      //分页

      $scope.grid = {
        page: 1,
        size: GLOBAL.size
      };
      $scope.status = {};
      $scope.gitStore = {};   //存储commit id 和 分支,angular修改数组内元素属性不能触发刷新

      $scope.$watch('grid.page', function (newVal, oldVal) {
        if (newVal != oldVal) {
          refresh(newVal);
        }
      });

      var refresh = function (page) {
        var skip = (page - 1) * $scope.grid.size;
        $scope.items = $scope.data.items.slice(skip, skip + $scope.grid.size);
      };

      //获取buildConfig列表
      var loadBuildConfigs = function () {
        BuildConfig.get({namespace: $rootScope.namespace}, function (data) {
          $log.info('buildConfigs', data);
          $scope.data = data;
          $scope.data.items = Sort.sort(data.items, -1);
          $scope.grid.total = data.items.length;

          fillImageStreams();

          refresh(1);

        }, function (res) {
          //todo 错误处理
        });
      };

      loadBuildConfigs();

      var fillImageStreams = function () {
        var items = angular.copy($scope.data.items);
        $scope.data.items = [];
        $scope.grid.total = 0;
        angular.forEach(items, function (item) {
          if (!item.spec.output.to) {
            return;
          }
          ImageStreamTag.get({namespace: $rootScope.namespace, name: item.spec.output.to.name}, function (data) {
            // console.log("-------", data);
            item.metadata.creationTimestamp = data.metadata.creationTimestamp;
            item.ist = data;
            $scope.data.items.push(item);
            $scope.grid.total++;
            refresh(1);

            var labels = data.image.dockerImageMetadata.Config.Labels;
            if (!labels) {
              return;
            }
            $scope.gitStore[item.spec.output.to.name] = {
              id: labels["io.openshift.build.commit.id"],
              ref: labels["io.openshift.build.commit.ref"]
            };

          });
        });
      };
      $scope.fyshow=true;
      $scope.doSearch = function (txt) {
        $scope.showTip = false;
        $scope.search(txt);
      }
      $scope.search = function (key, txt) {

        // console.log('grid.page',$scope.grid.page);
        if (!txt) {
          refresh(1);
          $scope.fyshow=true;
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

        $log.info($scope.items);
        if ($scope.grid.page == 1) {
          $scope.fyshow=false;
        }
        // $log.info($scope.data.items[0].metadata.name);
      };
      $scope.opened = true;
      $scope.ksearch = function (key,txt,event) {
        
        if (event.keyCode == 13) {
          if (!txt) {
            $scope.test = copytest
            $scope.opened = true;
            return;
          }
          // console.log(copytest)
        
          var namelist = [];
          txt = txt.replace(/\//g, '\\/');
          $http.get('/registry/api/search',
              {params: {q: txt}})
              .success(function (data) {
                // console.log(data)
                for (var i = 0; i < data.repository.length; i++) {
                  // console.log(data.repository[i].project_name);
                  namelist.push(data.repository[i].project_name)
                }
                namelist = namelist.unique();
                var item = [];
                for (var j = 0; j < namelist.length; j++) {
                  item.push({Name: namelist[j], items: []});
                  for (var k = 0; k < data.repository.length; k++) {
                    if (namelist[j] === data.repository[k].project_name) {
                      item[j].items.push(data.repository[k].repository_name);
                    }
                  }
                }

                for (var q = 0; q < copytest.length; q++) {
                  for (var r = 0; r < item.length; r++) {
                    if (item[r].Name === copytest[q].Name) {
                      item[r].CreationTime = copytest[q].CreationTime;
                      item[r].mysort = copytest[q].mysort;
                    }
                  }
                }
                item.sort(function (x, y) {
                  return x.mysort > y.mysort ? -1 : 1;
                });
                if (item[0].Name) {
                  // console.log(item);
                  $scope.test = item;
                  $scope.opened = false;
                }else {
                  $scope.test=null;
                }

              })
        }

      }
      $scope.gsearch = function (key, txt) {

        // $scope.keyCode = event.keyCode;
        // console.log(event.keyCode);
        if (!txt) {
          $scope.test = copytest
          $scope.opened = true;
          return;
        }
        // console.log(copytest);
        var namelist = [];
        txt = txt.replace(/\//g, '\\/');
        //
        // var reg = eval('/' + txt + '/');
        // /registry/api/search?q=baseimage
        $http.get('/registry/api/search',
            {params: {q: txt}})
            .success(function (data) {
              // console.log(data)
              for (var i = 0; i < data.repository.length; i++) {
                // console.log(data.repository[i].project_name);
                namelist.push(data.repository[i].project_name)
              }

              namelist = namelist.unique();
              var item = [];
              for (var j = 0; j < namelist.length; j++) {
                item.push({Name: namelist[j], items: []});
                for (var k = 0; k < data.repository.length; k++) {
                  if (namelist[j] === data.repository[k].project_name) {
                    item[j].items.push(data.repository[k].repository_name);
                  }
                }
              }

              for (var q = 0; q < copytest.length; q++) {
                for (var r = 0; r < item.length; r++) {
                  if (item[r].Name === copytest[q].Name) {

                    item[r].CreationTime = copytest[q].CreationTime;
                    item[r].mysort = copytest[q].mysort;
                  }
                }
              }
              item.sort(function (x, y) {
                return x.mysort > y.mysort ? -1 : 1;
              });
              if (item[0].Name) {
                // console.log(item);
                $scope.test = item;
                $scope.opened = false;
              }else {
                $scope.test=null;
              }

            })
      }
      var arr = [];
      var copytest = {};
      $http.get('/registry/api/projects', {
        params: {is_public: 1}
      }).success(function (data) {
        for (var i = 0; i < data.length; i++) {
          data[i].mysort = data[i].CreationTime
          data[i].mysort = (new Date(data[i].mysort)).getTime()
        }
        //时间冒泡排序写法
        data.sort(function (x, y) {
          return x.mysort > y.mysort ? -1 : 1;
        });
        $scope.test = data;
        for (var j = 0; j < $scope.test.length; j++) {
          $http.get('/registry/api/repositories', {params: {project_id: $scope.test[j].ProjectId}})
              .success(function (datalis) {
                arr.push(datalis);
                if (arr.length == data.length) {
                  for (var k = 0; k < arr.length; k++) {
                    if (arr[k] != null) {
                      for (var h = 0; h < $scope.test.length; h++) {
                        if (arr[k][0].split('/')[0] == $scope.test[h].Name) {
                          $scope.test[h].items = arr[k];
                          $scope.test[h].isshow = true;
                        }
                      }
                    }
                  }
                }

                copytest = angular.copy($scope.test);
                // console.log('$scope.test',$scope.test)

              }).error(function (msg) {

          })
        }
      }).error(function (data) {
        // $log.info('error',data)
        $rootScope.user = null;
        // console.log('error', $rootScope)
      });

    }]);
