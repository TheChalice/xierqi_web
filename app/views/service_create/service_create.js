'use strict';
angular.module('console.service.create', [
      {
        files: [
          'components/searchbar/searchbar.js',
          'components/checkbox/checkbox.js',
          'views/service_create/service_create.css'
        ]
      }
    ])
    .controller('ServiceCreateCtrl', ['$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service',
      function ($rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service) {
        $log.info('ServiceCreate');
        $scope.addprot = function (container, ind, last) {

          if (last) {     //添加
            container.ports.push({
              containerPort: "",
              protocol: "tcp",
              servicePort: "",

            })
          } else {
            container.ports.splice(ind, 1);
          }
        }
        $scope.dc = {
          kind: "DeploymentConfig",
          apiVersion: "v1",
          metadata: {
            name: {
              name:""
            },
            labels: {
              app: ""
            }
          },
          spec: {
            strategy: {},
            triggers: [],
            replicas: 1,
            selector: {
              app: "",
              deploymentconfig: ""
            },
            template: {
              metadata: {
                labels: {
                  app: "",
                  deploymentconfig: ""
                }
              },
              spec: {
                containers: [],
                "restartPolicy": "Always",
                "terminationGracePeriodSeconds": 30,
                "dnsPolicy": "ClusterFirst",
                "securityContext": {}
              }
            },
            test: false
          },
          status: {}
        };
        console.log($scope.dc.metadata.name)
        $scope.grid = {
          ports: [],
          port: 0,
          host: {
            name:''
          },
          suffix: '.app.dataos.io',
          imageChange: true,
          configChange: true,
          checkedsecond: false,
          auto: false,
          conflict: false,
          serviceConflict: false
        };
        $scope.grid.host=$scope.dc.metadata.name
        $scope.invalid = {};

        $scope.envs = [];

        $scope.containerTpl = {
          name: "",
          image: "",    //imageStreamTag
          ports: [{protocol: "tcp"}],
          "env": [],
          "resources": {},
          "imagePullPolicy": "Always",
          volumeMounts: [{}]
        };

        $scope.triggerConfigTpl = {
          "type": "ConfigChange"
        };

        $scope.triggerImageTpl = {
          "type": "ImageChange",
          "imageChangeParams": {
            "automatic": true,
            "containerNames": [
              ""          //todo 高级配置,手动填充
            ],
            "from": {
              "kind": "ImageStreamTag",
              "name": ""  //ruby-hello-world:latest
            }
          }
        };



        $scope.service = {
          "kind": "Service",
          "apiVersion": "v1",
          "metadata": {
            "name": "",
            "labels": {
              "app": ""
            }
          },
          "spec": {
            "ports": [],
            "selector": {
              "app": "",
              "deploymentconfig": ""
            },
            //"portalIP": "172.30.189.230",
            //"clusterIP": "172.30.189.230",
            "type": "ClusterIP",
            "sessionAffinity": "None"
          }
        };

        $scope.route = {
          "kind": "Route",
          "apiVersion": "v1",
          "metadata": {
            "name": "",
            "labels": {
              "app": ""
            }
          },
          "spec": {
            "host": "",
            "to": {
              "kind": "Service",
              "name": ""
            },
            "port": {
              "targetPort": ""
            }
          }
        };

        var initContainer = function () {
          if ($stateParams.image) {
            console.log("initContainer", $stateParams.image);
            var container = angular.copy($scope.containerTpl);
            container.image = $stateParams.image.metadata.name;
            if ($stateParams.image.tag) {
              container.tag = $stateParams.image.tag.name;
            }
            container.ports = [];
            var exposedPorts = $stateParams.image.image.dockerImageMetadata.Config.ExposedPorts;
            for (var k in exposedPorts) {
              var arr = k.split('/');
              if (arr.length == 2) {
                container.ports.push({
                  containerPort: parseInt(arr[0]),
                  servicePort: parseInt(arr[0]),
                  protocol: arr[1],
                  open: true
                });
              }
            }
            $scope.dc.spec.template.spec.containers.push(container);
            $scope.invalid.containerLength = false;
          }
        };
        initContainer();

        $scope.containerModal = function (idx) {
          var o = $scope.pods.items[idx];
          ContainerModal.open(o);
        };

        $scope.addContainer = function () {
          console.log("addContainer");
          $scope.dc.spec.template.spec.containers.push(angular.copy($scope.containerTpl));
          $scope.invalid.containerLength = false;
        };

        $scope.rmContainer = function (idx) {
          console.log("rmContainer");
          $scope.dc.spec.template.spec.containers.splice(idx, 1);
          isConflict();
        };

        var loadSecrets = function () {
          Secret.get({namespace: $rootScope.namespace}, function (res) {
            $log.info("secrets", res);

            $scope.secrets = res;
          }, function (res) {
            $log.info("load secrets err", res);
          });
        };
        loadSecrets();

        var loadBsi = function (dc) {
          BackingServiceInstance.get({namespace: $rootScope.namespace}, function (res) {
            $log.info("backingServiceInstance", res);

            for (var i = 0; i < res.items.length; i++) {
              if (!res.items[i].spec.binding) {
                continue;
              }
              for (var j = 0; j < res.items[i].spec.binding.length; j++) {
                if (res.items[i].spec.binding[j].bind_deploymentconfig == dc) {
                  res.items[i].bind = true;
                }
              }
            }

            $scope.bsi = res;

          }, function (res) {
            //todo 错误处理
            $log.info("loadBsi err", res);
          });
        };
        loadBsi();

        $scope.addSecret = function (name, idx, last) {
          var containers = $scope.dc.spec.template.spec.containers;
          var container = null;
          for (var i = 0; i < containers.length; i++) {
            if (containers[i].name == name) {
              container = containers[i];
            }
          }
          if (!container) {
            return;
          }
          if (last) {     //添加
            container.volumeMounts.push({});
          } else {
            container.volumeMounts.splice(idx, 1);
          }
        };

        $scope.addEnv = function (name, idx, last) {
          if (last) {     //添加
            $scope.envs.push({name: '', value: ''});
          } else {
            for (var i = 0; i < $scope.envs.length; i++) {
              if ($scope.envs[i].name == name) {
                $scope.envs.splice(i, 1);
              }
            }
          }
        };

        $scope.selectImage = function (idx) {
          var container = $scope.dc.spec.template.spec.containers[idx];
          ImageSelect.open().then(function (res) {
            console.log("imageStreamTag", res);
            container.image = res.metadata.name;
            container.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
            container.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];
            container.tag = res.tag.name;

            container.ports = [];
            var exposedPorts = res.image.dockerImageMetadata.Config.ExposedPorts;
            for (var k in exposedPorts) {
              var arr = k.split('/');
              if (arr.length == 2) {
                container.ports.push({
                  containerPort: '',
                  servicePort: '',
                  protocol: arr[1],
                  open: true
                });
              }
            }
          });
        };

        $scope.updatePorts = function () {
          $scope.grid.ports = [];
          angular.forEach($scope.dc.spec.template.spec.containers, function (item) {
            angular.forEach(item.ports, function (port) {
              if ($scope.grid.ports.indexOf(port.servicePort) == -1) {
                $scope.grid.ports.push(port.servicePort);
              }
            });
          });
        };

        var isConflict = function () {
          var conflict = false;
          var serviceConflict = false;
          var containers = $scope.dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            var ports = containers[i].ports;
            for (var j = 0; j < ports.length; j++) {
              conflict = portConflict(ports[j].containerPort, i, j, 'containerPort');
              serviceConflict = portConflict(ports[j].servicePort, i, j, 'servicePort');
              ports[j].conflict = conflict;
              ports[j].serviceConflict = serviceConflict;
            }
          }
          $scope.grid.conflict = conflict;
          $scope.grid.serviceConflict = serviceConflict;
          return conflict || serviceConflict;
        };

        var portConflict = function (port, x, y, tp) {
          var containers = $scope.dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            var ports = containers[i].ports;
            for (var j = 0; j < ports.length; j++) {
              if (i == x && j == y) {
                continue;
              }
              if (tp == 'containerPort' && ports[j].containerPort == port) {
                return true;
              }
              if (tp == 'servicePort' && ports[j].servicePort == port) {
                return true;
              }
            }
          }
          return false;
        };

        $scope.jump = function (d) {
          if (!valid($scope.dc)) {
            return;
          }
          $scope.grid.checked = d;
        };

        var prepareVolume = function (dc) {
          var containers = dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            var container = containers[i];
            for (var j = 0; j < container.volumeMounts.length; j++) {
              if (!container.volumeMounts[j].name || !container.volumeMounts[j].mountPath) {
                container.volumeMounts.splice(j, 1);
              }
            }
          }
        };

        var prepareTrigger = function (dc) {
          var triggers = [];
          if ($scope.grid.configChange) {
            triggers.push({type: 'ConfigChange'});
          }

          if ($scope.grid.imageChange) {
            var containers = dc.spec.template.spec.containers;
            for (var i = 0; i < containers.length; i++) {
              triggers.push({
                type: 'ImageChange',
                imageChangeParams: {
                  "automatic": true,
                  "containerNames": [containers[i].name],
                  "from": {
                    "kind": "ImageStreamTag",
                    "name": containers[i].image
                  }
                }
              });
            }
          }
          dc.spec.triggers = triggers;
        };

        var bindService = function (dc) {
          angular.forEach($scope.bsi.items, function (bsi) {
            var bindObj = {
              metadata: {
                name: bsi.metadata.name
              },
              resourceName: dc.metadata.name,
              bindResourceVersion: '',
              bindKind: 'DeploymentConfig'
            };

            if (bsi.bind) {  //未绑定设置为绑定
              BackingServiceInstance.bind.create({
                namespace: $rootScope.namespace,
                name: bsi.metadata.name
              }, bindObj, function (res) {
                $log.info("bind service success", res);
              }, function (res) {
                $log.info("bind service fail", res);
              });
            }
          });
        };

        var createService = function (dc) {

          prepareService($scope.service, dc);

          var ps = [];
          var containers = dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            var ports = containers[i].ports;
            for (var j = 0; j < ports.length; j++) {
              if (!ports[j].open) {
                continue;
              }
              ps.push({
                name: ports[j].servicePort + '-' + ports[j].protocol.toLowerCase(),
                port: ports[j].servicePort,
                protocol: ports[j].protocol,
                targetPort: ports[j].containerPort
              });
            }
          }
          if (ps.length > 0) {
            $scope.service.spec.ports = ps;
          } else {
            $scope.service.spec.ports = null;
          }
          Service.create({namespace: $rootScope.namespace}, $scope.service, function (res) {
            $log.info("create service success", res);
            $scope.service = res;

            if ($scope.grid.route) {
              createRoute(res);
            }
            $state.go('console.service_detail', {name: dc.metadata.name});
          }, function (res) {
            $log.info("create service fail", res);
            $state.go('console.service_detail', {name: dc.metadata.name});
          });
        };

        var prepareService = function (service, dc) {
          service.metadata.name = dc.metadata.name;
          service.metadata.labels.app = dc.metadata.name;
          service.spec.selector.app = dc.metadata.name;
          service.spec.selector.app = dc.metadata.name;
        };

        var prepareDc = function (dc) {
          var name = dc.metadata.name;
          dc.metadata.labels.app = name;
          dc.spec.selector.app = name;
          dc.spec.selector.deploymentconfig = name;
          dc.spec.template.metadata.labels.app = name;
          dc.spec.template.metadata.labels.deploymentconfig = name;
        };

        var prepareEnv = function (dc) {
          var containers = dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            containers[i].env = $scope.envs;
          }
        };

        var prepareRoute = function (route, service) {
          route.metadata.name = service.metadata.name;
          route.metadata.labels.app = service.metadata.name;
          route.spec.host = $scope.grid.host + $scope.grid.suffix;
          route.spec.to.name = service.metadata.name;
          route.spec.port.targetPort = $scope.grid.port + '-tcp';
        };

        var createRoute = function (service) {
          prepareRoute($scope.route, service);

          Route.create({namespace: $rootScope.namespace}, $scope.route, function (res) {
            $log.info("create route success", res);
            $scope.route = res;
          }, function (res) {
            $log.info("create route fail", res);
          });
        };

        var valid = function (dc) {
          var containers = dc.spec.template.spec.containers;
          if (!containers.length) {
            $scope.invalid.containerLength = true;
            return false;
          }

          for (var i = 0; i < containers.length; i++) {
            if (!containers[i].name) {
              containers[i].emptyName = true;
              return false;
            }
            if (!containers[i].image) {
              containers[i].emptyImage = true;
              return false;
            }
          }

          if (isConflict()) {
            return false;
          }
          return true;
        };

        $scope.createDc = function () {
          var dc = angular.copy($scope.dc);

          if (!valid(dc)) {
            return;
          }

          prepareDc(dc);
          prepareVolume(dc);
          prepareTrigger(dc);
          prepareEnv(dc);

          if (!$scope.grid.auto) {
            dc.spec.replicas = 0;
          }

          DeploymentConfig.create({namespace: $rootScope.namespace}, dc, function (res) {
            $log.info("create dc success", res);
            createService(dc);
            bindService(dc);
          }, function (res) {
            //todo 错误处理
            $log.info("create dc fail", res);
          });
        };
      }]);

