# winston-graylog2 
_A graylog2 transport for [winston][0]_

## Install
``` sh
npm install winston-graylog2
```

## Usage
A convenience wrapper may be supported in the future but for now the
easiest way to use is to instantiate a new winston
logger and add `winston-graylog2` as a transport.

``` js
var winston = require("winston"),
graylog2 = require("winston-graylog2").Graylog2,
levels = winston.config.syslog.levels;

// Initialize logger
var logger = new (winston.Logger)({
  levels: levels,
  transports: [new (graylog2)()]
});

// Log something
logger.log('emerg', 'FIX THIS NOW');
logger.emerg('NO RLY');
```

The default winston logger settings should not be used because Graylog2
expects the log levels to be syslog levels.  All else should function
the same as other loggers.  

## TODO
1. Add chunking to messages
2. More pleasant way to flatten meta fields without changing logger api

## References
1. [winston][0]
2. [node-graylog][1]
3. [winston-riak][2]
4. [gelf spec][3]
5. [graylog2][4]

## Notes
There is another winston-graylog2 module,
[http://github.com/flite/winston-graylog2.git][5], that was made
independently. I opted to keep this repo separate for a few reasons,
one of them being that only a subset of the syslog logging levels are
exposed in the other project.

[0]: https://github.com/flatiron/winston
[1]: http://github.com/egorFiNE/node-graylog
[2]: http://github.com/indexzero/winston-riak
[3]: https://github.com/Graylog2/graylog2-docs/wiki/GELF
[4]: http://www.graylog2.org
[5]: http://github.com/flite/winston-graylog2.git
