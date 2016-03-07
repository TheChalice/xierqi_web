'use strict';

angular.module('home.view1', [
    {
        files:['../bower_components/ng-file-upload/ng-file-upload-all.min.js']
    }
])
    .controller('View1Ctrl', ['$log', '$scope', 'Confirm', 'Alert', 'Upload', function ($log, $scope, Confirm, Alert, Upload) {
        $log.info('View1Ctrl');

        $scope.acceptSelect = 'image/*,audio/*,video/*';
        $scope.capture = 'camera';
        $scope.pattern = 'image/*,audio/*,video/*';
        $scope.validate = "{size: {max: '20MB', min: '10B'}, height: {max: 12000}, width: {max: 12000}, duration: {max: '5m'}}";
        $scope.dragOverClass = '{accept:"dragover", reject:"dragover-err", pattern:"image/*,audio/*,video/*,text/*"}';
        $scope.modelOptions = '{"debounce":100}';
        $scope.resize = '{width: 1000, height: 1000, centerCrop: true}';
        $scope.resizeIf = '$width > 5000 || $height > 5000';
        $scope.dimensions = '$width < 12000 || $height < 12000';
        $scope.duration = '$duration < 10000';
        $scope.chunkSize = 100000;

        // upload later on form submit or something similar
        $scope.submit = function () {
            $log.info("submit", $scope.file);
            $scope.uploadPic($scope.file);
        };

        // upload on file select or drop
        $scope.uploadPic = function (file) {
            Upload.upload({
                url: 'upload/url',
                data: {file: file}
            }).then(function (resp) {
                console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            }, function (resp) {
                console.log('Error status: ' + resp.status);
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
            });
        };

    }]);

