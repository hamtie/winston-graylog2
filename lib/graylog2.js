var util = require('util'),
dgram = require('dgram'),
os = require('os'),
winston = require('winston'),
compress = require('compress-buffer').compress,
syslogCodes = require('./syslog-codes').codes,
Transport = winston.Transport;

GELF_VERSION = '1.0'

var Graylog2 = exports.Graylog2 = function (options) {
    Transport.call(this, options);  
    options     = options        || {};
    this.name   = 'Graylog2';
    this.host   = options.host   || 'localhost';
    this.port   = options.port   || 12201;
    this.level  = options.level  || 'info';
    this.client = dgram.createSocket("udp4");
    this.hostname = os.hostname();
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

    if (this.silent) {
        return callback(null, true);
    }
    
    var message = {
        version: GELF_VERSION,
        host: this.hostname,
        short_message: msg,
        timestamp: ((new Date()).getTime()/1000).toFixed(2),
        level: syslogCodes[level],
        facility: 'winston-graylog2'
    };

    if (meta) {
        message["_meta"] = JSON.stringify(meta);
    } 

    msg = compress(new Buffer(JSON.stringify(message)));
    this.client.send(msg, 0, msg.length, this.port, this.host, function(err, bytes){
        if (err) { this.emit('error', err); }
        this.emit('logged');
    });

    callback(null, true);
};

Graylog2.prototype.close = function () {
    this.client.close();
};
