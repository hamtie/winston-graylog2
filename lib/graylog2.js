var util = require('util'),
dgram = require('dgram'),
os = require('os'),
winston = require('winston'),
compress = require('compress-buffer').compress,
syslogCodes = require('./syslog-codes').codes,
Transport = winston.Transport;

var GELF_VERSION = '1.0';

var Graylog2 = exports.Graylog2 = function (options) {
    Transport.call(this, options);  
    options            = options              || {};
    this.name          = 'Graylog2';
    this.host          = options.host         || 'localhost';
    this.port          = options.port         || 12201;
    this.level         = options.level        || 'info';
    this.facility      = options.facility      || 'winston-graylog2';
    this.timestamp     = options.timestamp    || 
        function() { ((new Date()).getTime()/1000).toFixed(2); };
    this.client = dgram.createSocket("udp4");
    this.hostname = os.hostname();
    this.pid = process.pid;
  };

//
// Inherit from `winston.Transport`.
//
util.inherits(Graylog2, Transport);

//
// Define a getter so that `winston.transports.Riak` 
// is available and thus backwards compatible.
//
winston.transports.Graylog2 = Graylog2;

Graylog2.prototype.log = function (level, msg, meta, callback) {
    var self = this;
    var timestamp = typeof self.timestamp === 'function' ? self.timestamp() : self.timestamp;

    if (self.silent) {
        return callback(null, true);
    }
    
    var message = {
        version: GELF_VERSION,
        host: self.hostname,
        short_message: msg,
        timestamp: timestamp,
        level: syslogCodes[level],
        facility: this.facility,
        _pid: self.pid,
        _cwd: process.cwd()
    };

    if (meta) {
        message["_meta"] = JSON.stringify(meta);
    } 

    msg = compress(new Buffer(JSON.stringify(message)));
    if (msg.length>8192) {
      util.log('Message too long. Printing to stdout:\n' + JSON.stringify(message) + '\n');
    } else {
        self.client.send(msg, 0, msg.length, self.port, self.host, function(err, bytes){
                             if (err) { self.emit('error', err); }
                             self.emit('logged');
                         });

    }


    callback(null, true);
};

Graylog2.prototype.close = function () {
    this.client.close();
};
