var util = require('util'),
dgram = require('dgram'),
os = require('os'),
winston = require('winston'),
crypto = require('crypto'),
compress = require('compress-buffer').compress,
syslogCodes = require('./syslog-codes').codes,
Transport = winston.Transport;

var GELF_VERSION = '1.0';
var CHUNK_SIZE = 8192;

var Graylog2 = exports.Graylog2 = function (options) {
    Transport.call(this, options);  
    options            = options              || {};
    this.name          = 'Graylog2';
    this.host          = options.host         || 'localhost';
    this.port          = options.port         || 12201;
    this.level         = options.level        || 'info';
    this.facility      = options.facility     || 'winston-graylog2';
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
// Define a getter so that `winston.transports.Graylog2` 
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
        facility: self.facility,
        _pid: self.pid,
        _cwd: process.cwd()
    };

    if (meta) {
        message["_meta"] = JSON.stringify(meta);
    } 
 
    message = JSON.stringify(message);
    if (message.length > CHUNK_SIZE) {
        self._chunkify(message, CHUNK_SIZE);
    } else {
        self._send(message);
    }
    callback(null, true);
};

Graylog2.prototype._send = function(msg, offset) {
    var self = this;
    offset = offset || 0;
    msg = compress(new Buffer(msg));
    self.client.send(msg, offset, msg.length, self.port, self.host, function(err, bytes){
        if (err) { self.emit('error', err); }
        self.emit('logged');
    });
};

Graylog2.prototype._md5 = function(s) {
    var md5 = crypto.createHash('md5');
    md5.update(s);
    return (md5.digest('hex'));
};

Graylog2.prototype._makeChunkHeader = function(time, i, n) {
    var self = this;
    var id = time + self.hostname + n;
    var header = 0x1e0f + "11111111" + i + n;
    return (header);
 };

Graylog2.prototype._chunkify = function(msg, chunk_size) {
    var self = this;
    var time = new Date().getTime();
    var total_chunks = Math.ceil(msg.length/chunk_size);
    for (i=0; i < total_chunks; i+=1) {
        var piece = msg.slice(i*chunk_size,(i+1)*chunk_size);
        var header = self._makeChunkHeader(time, i+1, total_chunks);
        self._send(header+piece, (header+piece).length*i);
    }
};

Graylog2.prototype.close = function () {
    this.client.close();
};
