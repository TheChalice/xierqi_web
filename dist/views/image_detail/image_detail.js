angular.module("console.image_detail",[{files:["components/searchbar/searchbar.js"]}]).controller("ImageDetailCtrl",["$scope","$log","ImageStreamTag","$stateParams",function(e,t,n,r){t.info("ImageDetailCtrl");var i=function(){n.get({name:r.name},function(n){t.info("data",n),e.data=n})};i()}]);