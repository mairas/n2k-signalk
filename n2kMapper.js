var n2kMappings = require("./n2kMappings.js").mappings;
var through = require('through');


var toFlat = function (n2k) {
    return {
      updates: [
        {
          source: {
            pgn: n2k.pgn,
            timestamp: n2k.timestamp,
            src: n2k.src
          },
          values : toValuesArray(n2k)
        }
      ]
    }
}

var toValuesArray = function (n2k) {
  var theMappings = n2kMappings[n2k.pgn];
  if (typeof theMappings != 'undefined') {
    return theMappings
      .filter(function (theMapping) {
        try {
          return typeof theMapping.filter === 'undefined' || theMapping.filter(n2k);
        } catch (ex) {
          process.stderr.write(ex + ' ' + n2k);
          return false;
        }
      })
      .map(function (theMapping) {
        try {
          return  {
            path: theMapping.node,
            value: typeof theMapping.source != 'undefined' ?
              Number(n2k.fields[theMapping.source]) :
              theMapping.value(n2k),
            source: {
              pgn: n2k.pgn,
              timestamp: n2k.timestamp,
              src: n2k.src
            }
          }
        } catch (ex) {
          process.stderr.write(ex + ' ' + n2k);
        }
      })
      .filter(function (x) {
        return x != undefined;
      });
  }
  return [];
}

var addToTree = function (pathValue, source, tree) {
  var result = {};
  var temp = tree;
  var parts = msg.path.split('.');
  for (var i = 0; i < parts.length - 1; i++) {
    temp[parts[i]] = {};
    temp = temp[parts[i]];
  }
  temp[parts[parts.length - 1]] = msg;
  return result;
}


function addAsNested(pathValue, source, result) {
  var temp = result;
  var parts = pathValue.path.split('.');
  for (var i = 0; i < parts.length - 1; i++) {
    if (typeof temp[parts[i]] === 'undefined') {
      temp[parts[i]] = {};
    }
    temp = temp[parts[i]];
  }
  temp[parts[parts.length - 1]] = {
    value: pathValue.value,
    source: source
  }
}

function deltaToNested(delta) {
  var result = {};
  delta.updates[0].values.forEach(function(pathValue) {
    addAsNested(pathValue, delta.updates[0].source, result);
  });
  return result;
}

exports.toFlat = toFlat;
exports.toNested = function (n2k) {
  return deltaToNested(toFlat(n2k));
}

exports.toFlatTransformer = function (options) {
  var stream = through(function (data) {
    if (options.debug) {
      console.log(data);
    }
    stream.queue(exports.toFlat(data));
  });
  return stream;
}

exports.toNestedTransformer = function (options) {
  var stream = through(function (data) {
    if (options.debug) {
      console.log(data);
    }
    var nested = exports.toNested(data);
    if (Object.getOwnPropertyNames(nested).length > 0) {
      stream.queue(nested);
    }
  });
  return stream;
}