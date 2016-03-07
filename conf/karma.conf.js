module.exports = function (config) {
    config.set({

        basePath: '../',

        files: [
            {pattern: 'bower_components/angular/angular.min.js', included: false},
            {pattern: 'bower_components/angular-mocks/angular-mocks.js', included: false},
            {pattern: 'bower_components/angular-animate/angular-animate.min.js', included: false},
            {pattern: 'bower_components/angular-resource/angular-resource.min.js', included: false},
            {pattern: 'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js', included: false},
            {pattern: 'bower_components/angular-ui-router/release/angular-ui-router.min.js', included: false},
            {pattern: 'bower_components/ng-file-upload/ng-file-upload-all.min.js', included: false},
            {pattern: 'bower_components/oclazyload/dist/ocLazyLoad.min.js', included: false},
            {pattern: 'app/pub/*.js', included: false},
            {pattern: 'app/components/**/*.js', included: false},
            {pattern: 'app/views/**/*.js', included: false},
            {pattern: 'app/app.js', included: false},
            {pattern: 'app/router.js', included: false},
            'app/main.js'
        ],

        autoWatch: true,

        frameworks: ['jasmine', 'requirejs'],

        browsers: ['Chrome'],

        plugins: [
            'karma-chrome-launcher',
            'karma-jasmine',
            'karma-requirejs',
            'karma-junit-reporter'
        ],

        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
