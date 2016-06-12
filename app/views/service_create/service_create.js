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
        $scope.checkEnv = false;
        $scope.addprot = function (container, ind, last) {

          if (last) {     //添加
            container.ports.push({
              containerPort: "",
              protocol: "",
              hostPort: "",
            })
          } else {
            container.ports.splice(ind, 1);
          }
        }

        $scope.dc = {
          kind: "DeploymentConfig",
          apiVersion: "v1",
          metadata: {
            name: "",
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
                "securityContext": {},
                'volumes': []
              }
            },
            test: false
          },
          status: {}
        };

        $scope.grid = {
          ports: [],
          port: 0,
          host: '',
          suffix: '.app.dataos.io',
          imageChange: true,
          configChange: true,
          checkedsecond: false,
          auto: true,
          conflict: false,
          serviceConflict: false,
          servicepot: false,
          servicepoterr : false
        };
        // $scope.grid.host=$scope.dc.metadata.name
        $scope.invalid = {};

        $scope.envs = [];

        $scope.createdcerr = "";

        $scope.containerTpl = {
          name: "",
          image: "",    //imageStreamTag
          ports: [{protocol: ""}],
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
            console.log("$stateParams.image", $stateParams.image);
            // console.log("initContainer", $scope.dc.spec.template.spec.containers.tag);
            // if (!$scope.dc.spec.template.spec.containers.tag) {
            //   $scope.named=$stateParams.image.metadata.name;
            // }
            // console.log("initContainer", $stateParams.image.metadata.name);
            if ($stateParams.image.metadata) {
              var container = angular.copy($scope.containerTpl);
              container.image = $stateParams.image.metadata.name;
              console.log($stateParams.image.metadata.name)
              if ($stateParams.image.tag) {
                container.tag = $stateParams.image.tag.name;

              }
              // console.log($stateParams.image.metadata.name.split(':')[1]);
              container.tag=$stateParams.image.metadata.name.split(':')[1];
              console.log($scope.dc.spec.template.spec.containers);
              container.strname=container.name=$stateParams.image.metadata.name.split(':')[0]
              console.log($stateParams.image.metadata.name.split(':')[0]);
              container.ports = [];
              var exposedPorts = $stateParams.image.image.dockerImageMetadata.Config.ExposedPorts;
              if (!$stateParams.image.image.dockerImageMetadata.Config.ExposedPorts) {
                container.ports.push({
                  containerPort: "",
                  hostPort: "",
                  protocol: "",
                })
              }
              for (var k in exposedPorts) {
                var arr = k.split('/');
                if (arr.length == 2) {
                  var val = arr[1].toUpperCase()
                  container.ports.push({
                    containerPort: parseInt(arr[0]),
                    hostPort: parseInt(arr[0]),
                    protocol: val,
                    //open: true
                  });
                }
              }
              // $scope.dc.spec.template.spec.containers[0].name=$stateParams.image.metadata.name.split(':')[0]

              $scope.dc.spec.template.spec.containers.push(container);
              $scope.invalid.containerLength = false;
            }else {
              var proto = $stateParams.image;
              var jingxing = $stateParams.image.split(':')[0];
              var banben = $stateParams.image.split(':')[1];
              var container = angular.copy($scope.containerTpl);
              container.image = proto;
              // console.log($stateParams.image.metadata.name.split(':')[1]);
              container.tag=banben;
              // console.log($scope.dc.spec.template.spec.containers);
              container.strname=container.name=jingxing;

              container.ports = [];

                container.ports.push({
                  containerPort: "",
                  hostPort: "",
                  protocol: "",
                })


              // $scope.dc.spec.template.spec.containers[0].name=$stateParams.image.metadata.name.split(':')[0]

              $scope.dc.spec.template.spec.containers.push(container);
              $scope.invalid.containerLength = false;
            }


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
        
        $scope.serviceNamekedown = function(){
          var oldname = angular.copy($scope.dc.metadata.name);
          if(oldname == $scope.dc.metadata.name){
            $scope.createdcerr = "";
          }
        }

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
          $log.info('$scope.dcdc.spec.template.spec.containers-=-=-=-=-=-=-=', $scope.dc.spec.template.spec.containers)
          var containers = $scope.dc.spec.template.spec.containers;
          var volumes = $scope.dc.spec.template.spec.volumes;
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
          var cons = $scope.dc.spec.template.spec.containers;
          ImageSelect.open().then(function (res) {
            console.log("imageStreamTag", res);
            console.log('container', container)
            container.ports = [];
            if (container.ports.length == 0) {
              container.ports.push({
                containerPort: '',
                hostPort: '',
                protocol: '',
                //open: true
              })
            }
            container.image = res.metadata.name;
            var str = res.metadata.name.split(":");
            var strname = str[0];
            if (idx > 0) {
              if (cons[idx - 1].image.split(":")[0] == strname) {
                strname = str[0] + idx;
              }
            }
            console.log("strwoshishui=0=0=0",str);
            container.strname = strname;
            container.name = strname;
            container.tag = str[1];
            if(res.image.dockerImageMetadata.Config.Labels){
              container.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
              container.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];
            }


            var exposedPorts = res.image.dockerImageMetadata.Config.ExposedPorts;
            for (var k in exposedPorts) {
              var arr = k.split('/');
              if (arr.length == 2) {
                container.ports = [];
                var val = arr[1].toUpperCase()
                container.ports.push({
                  containerPort: '',
                  hostPort: '',
                  protocol: '',
                  //open: true
                });
              }
            }
          });
        };

        $scope.updatePorts = function () {
          $scope.grid.ports = [];
          angular.forEach($scope.dc.spec.template.spec.containers, function (item) {
            angular.forEach(item.ports, function (port) {
              if ($scope.grid.ports.indexOf(port.hostPort) == -1) {
                $scope.grid.ports.push(port.hostPort);
              }
            });
          });
        };
        //
        var isConflict = function () {
          var conflict = false;
          var serviceConflict = false;
          var containers = $scope.dc.spec.template.spec.containers;
          for (var i = 0; i < containers.length; i++) {
            var ports = containers[i].ports;
            for (var j = 0; j < ports.length; j++) {
              conflict = portConflict(ports[j].containerPort, i, j, 'containerPort');
              serviceConflict = portConflict(ports[j].hostPort, i, j, 'hostPort');
              ports[j].conflict = conflict;
              ports[j].serviceConflict = serviceConflict;

              if (ports[j].containerPort && ports[j].hostPort) {
                
                $scope.grid.servicepot = false;
                $scope.grid.conflict = conflict;
                $scope.grid.serviceConflict = serviceConflict;
                return conflict || serviceConflict;
              }else if (!ports[j].containerPort && !ports[j].containerPort) {
                return false
              } else {
                
                $scope.grid.servicepot = true;
                return true
              }
            }
          }



          // console.log('ports', ports.containerPort)
          // return conflict || serviceConflict;
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
              if (tp == 'hostPort' && ports[j].hostPort == port) {
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
            for (var j = 0; j < container.volumeMounts.length;) {
              if (!container.volumeMounts[j].name || !container.volumeMounts[j].mountPath) {
                //$log.info("remove " + j + " from volumeMounts total has " + container.volumeMounts.length);
                container.volumeMounts.splice(j, 1);
                j = 0;
              } else {
                j++;
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
              //if (!ports[j].open) {
              //  continue;
              //}
              var val = ports[j].protocol.toUpperCase()
              ps.push({
                name: ports[j].hostPort + '-' + ports[j].protocol.toLowerCase(),
                port: parseInt(ports[j].hostPort),
                protocol: val,
                targetPort: parseInt(ports[j].containerPort)
              });
            }
          }
          if (ps.length > 0) {
            $scope.service.spec.ports = ps;
          } else {
            $scope.service.spec.ports = null;
          }
          $log.info('$scope.service0-0-0-0-', $scope.service.spec.ports);
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
          service.spec.selector.deploymentconfig = dc.metadata.name;
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
          var reg = new	RegExp(/^[a-zA-Z_]+[a-zA-Z0-9_]*$/gi);
          for (var i = 0; i < containers.length; i++) {

            var thisenv = angular.copy($scope.envs);
            for(var k = 0 ; k <  $scope.envs.length;k++){
              if(!$scope.envs[k].name){
                 thisenv.splice(k, 1);
              }
            }
            containers[i].env = thisenv;
            //console.log(containers[i]);
            for(var j = 0; j <  containers[i].env.length;j++){
              if(reg.test(containers[i].env[j].name) == false){
                  $scope.checkEnv = true;
                  return false;
              }
            }

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
          console.log('dc',dc);
          var containers = dc.spec.template.spec.containers;
          if (!containers.length) {
            
            $scope.invalid.containerLength = true;
            return false;
          }

          for (var i = 0; i < containers.length; i++) {
            if (!containers[i].strname) {
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
          $rootScope.lding = true;
          var dc = angular.copy($scope.dc);
          var cons = angular.copy($scope.dc.spec.template.spec.containers);
          var flog = 0;
          for (var i = 0; i < dc.spec.template.spec.containers.length; i++) {
            $scope.dc.spec.template.spec.containers[i].name = dc.spec.template.spec.containers[i].strname;
            delete dc.spec.template.spec.containers[i]["strname"];
            for (var j = 0; j < dc.spec.template.spec.containers[i].volumeMounts.length; j++) {
              if (dc.spec.template.spec.containers[i].volumeMounts[j].name) {
                flog++;
                var volume1 = "volume" + flog;
                dc.spec.template.spec.volumes.push(
                    {
                      "name": volume1,
                      "secret": {
                        "secretName": dc.spec.template.spec.containers[i].volumeMounts[j].name
                      }
                    }
                );
                dc.spec.template.spec.containers[i].volumeMounts[j].name = volume1;
              }
            }
            var testlength = cons[i].ports.length;
            for (var k = 0; k < testlength; k++) {
              if (!cons[i].ports[k].containerPort) {
                cons[i].ports.splice(k, 1);
                k--;
                testlength--;
              } else {
                cons[i].ports[k].name = cons[i].ports[k].protocol + "-" + cons[i].ports[k].containerPort;
                cons[i].ports[k].protocol = cons[i].ports[k].protocol.toUpperCase()
              }
            }
            dc.spec.template.spec.containers[i].ports = cons[i].ports;
          }

          if (!valid($scope.dc)) {
            return;
          }

          prepareDc(dc);
          prepareVolume(dc);
          prepareTrigger(dc);
          prepareEnv(dc);
          if (!$scope.grid.auto) {
            dc.spec.replicas = 0;
          }
          var createports = true;
          var thisdccon = $scope.dc.spec.template.spec.containers;
          for(var i = 0 ;i < thisdccon.length;i++) {
            if (thisdccon[i].ports) {
              for (var j = 0; j < thisdccon[i].ports.length; j++) {
                if (thisdccon[i].ports[j].hostPort && thisdccon[i].ports[j].protocol && thisdccon[i].ports[j].containerPort) {
                  if (thisdccon[i].ports[j].containerPort || thisdccon[i].ports[j].hostPort) {
                    console.log("1111");
                    if (thisdccon[i].ports[j].containerPort < 1 || thisdccon[i].ports[j].containerPort > 65535 || thisdccon[i].ports[j].hostPort < 1 || thisdccon[i].ports[j].hostPort > 64435) {
                      console.log("1234567890pertyuiop")
                      createports = false;
                      $scope.grid.servicepoterr = true;
                    }
                  }
                } else if (!thisdccon[i].ports[j].hostPort && !thisdccon[i].ports[j].containerPort && !thisdccon[i].ports[j].protocol) {
                  console.log("2222");
                } else {
                  createports = false;
                  $scope.grid.servicepoterr = true;
                  console.log("33333");
                }
              }
            }
          }
          console.log(createports);
          if(createports == false){
            return;
          }
          var clonedc = angular.copy(dc);
          for(var i = 0;i<clonedc.spec.template.spec.containers.length;i++){
            delete clonedc.spec.template.spec.containers[i]["commitId"];
            delete clonedc.spec.template.spec.containers[i]["ref"];
            delete clonedc.spec.template.spec.containers[i]["tag"];
            if(clonedc.spec.template.spec.containers[i].ports){
                delete clonedc.spec.template.spec.containers[i]["ports"];
            }
            if(clonedc.spec.template.spec.containers[i].env.length == 0){
              delete clonedc.spec.template.spec.containers[i]["env"];
            }
          }
          DeploymentConfig.create({namespace: $rootScope.namespace}, clonedc, function (res) {
            $log.info("create dc success", res);
            var isport = false;
            for (var i = 0; i < dc.spec.template.spec.containers.length; i++) {
              if (dc.spec.template.spec.containers[i].ports.length != 0) {
                isport = true;
                break;
              }
            }
            if (isport) {
              createService(dc);
              bindService(dc);
            } else {
              $state.go('console.service_detail', {name: dc.metadata.name});
            }
          }, function (res) {
            //todo 错误处理
            $log.info("create dc fail", res);
            if(res.status == 409){
             $scope.createdcerr = "服务名称重复";
            }
          });
        };
      }]);

