// Karma configuration
// Generated on Sun Jul 17 2016 20:55:55 GMT-0300 (BRT)
const webpackConfig = require('./webpack.test.config.js');

module.exports = (config) => {
  config.set({

    basePath: '',

    frameworks: ['mocha', 'sinon'],

    files: [
      'tests/*.test.js',
      'tests/**/*.test.js',
      './node_modules/es6-promise/dist/es6-promise.js',
    ],

    webpack: webpackConfig,

    preprocessors: {
      'tests/*.test.js': ['webpack'],
      'tests/**/*.test.js': ['webpack'],
    },

    reporters: ['mocha'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,


    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: process.env.TEST_ENV === 'CI',

    concurrency: Infinity,
  });
};
