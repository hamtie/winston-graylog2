# winston-graylog2 >> A graylog2 transport for winston

## Install

From github:

```
git clone git@github.com:fouasnon/winston-graylog2.git
npm install ./winston-graylog2
```

## Usage

A convenience wrapper may be supported in the future but for now the
easiest way to use `winston-graylog2` is to instantiate a new winston
logger and add `winston-graylog2` as a transport.

```
var winston = require("winston"),
graylog2 = require("winston-graylog2").Graylog2,
levels = winston.config.syslog.levels;

var logger = new (winston.Logger)({
  levels: levels,
  transports: [new (graylog2)()]
});
```

The default winston logger settings should not be used because Graylog2
expects the log levels to be syslog levels.  All else should function
the same as other loggers.  


## References
1. winston `https://github.com/flatiron/winston`
2. independent graylog2 module `http://github.com/egorFiNE/node-graylog`
3. winston-riak transport `http://github.com/indexzero/winston-riak`

## Notes
There is another winston-graylog2 module,
`http://github.com/flite/winston-graylog2.git`, that was made
independently. I opted to keep this repo separate for a few reasons,
one of them being that only a subset of the syslog logging levels are
exposed in the other project.
