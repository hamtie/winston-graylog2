
var vows = require('vows'),
    assert = require('assert'),
    winston = require('winston'),
    helpers = require('winston/test/helpers'),
    levels = winston.config.syslog.levels,
    Graylog2 = require('../lib/graylog2').Graylog2;


function assertGraylog2 (transport) {
  assert.instanceOf(transport, Graylog2);
  assert.isFunction(transport.log);
};

var transport = new Graylog2();

vows.describe('winston-graylog2').addBatch({
 "An instance of the Graylog2 Transport": {
   "should have the proper methods defined": function () {
     assertGraylog2(transport);
   }}}).export(module);
