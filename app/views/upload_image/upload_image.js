'use strict';
angular.module('home.uploadimage', [{
    files: [
        'views/upload_image/upload_image.css'
    ]
}])
    .controller('uploadimageCtrl', ['Cookie', '$rootScope',
        function (Cookie, $rootScope) {
            console.log('123456789')
        }]);

