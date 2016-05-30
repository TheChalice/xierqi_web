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

      $scope.doSearch = function (txt) {
        $scope.showTip = false;
        $scope.search(txt);
      }
      $scope.search = function (key, txt) {
        if (!txt) {
          refresh(1);
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
        $log.info($scope.data.items[0].metadata.name);
      }
      function getJson(url) {
        var deferred = $q.defer();
        $http.get(url, {params: {is_public: 1}})
            .success(function (d) {
              deferred.resolve(d);
            });
        return deferred.promise;
      }

      var arr = [];
      getJson('/registry/api/projects')
          .then(function (data) {
            for (var i = 0; i < data.length; i++) {
              data[i].mysort = data[i].CreationTime
              data[i].mysort = (new Date(data[i].mysort)).getTime()
            }
            // console.log(data)
            //时间冒泡排序写法
            data.sort(function (x, y) {
              return x.mysort > y.mysort ? -1 : 1;
            });

            $scope.test = data;

            for (var j = 0; j < $scope.test.length; j++) {
              $http.get('/registry/api/repositories', {params: {project_id: $scope.test[j].ProjectId}})
                  .success(function (datalis) {
                    arr.push(datalis);
                  }).then(function () {

                if (arr.length == data.length) {
                  // console.log(arr);
                  for (var k = 0; k < arr.length; k++) {
                    if (arr[k] != null) {
                      // console.log(k,arr[k])
                      for (var h = 0; h < $scope.test.length; h++) {
                        if (arr[k][0].split('/')[0] == $scope.test[h].Name) {
                          // console.log(arr[k][0].split('/')[0])
                          // console.log('$scope.test[k].Name', $scope.test[h].Name);
                          $scope.test[h].items = arr[k]
                          // console.log($scope.test[h].items, arr[k]);
                        }
                      }
                      // console.log($scope.test)
                    }
                  }
                  // console.log($scope.test)

                }


              }).then(function () {

              })
            }
          })
    }]);
