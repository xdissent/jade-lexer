'use strict';

var fs = require('fs');
var assert = require('assert');
var lex = require('../');
var dir = __dirname + '/cases/';
var hasErrors = true;

fs.readdirSync(dir).forEach(function (testCase) {
  if (/\.jade$/.test(testCase)) {
    console.dir(testCase);
    var expected = fs.readFileSync(dir + testCase.replace(/\.jade$/, '.expected.json'), 'utf8')
                     .split(/\n/).map(JSON.parse);
    var result = lex(fs.readFileSync(dir + testCase, 'utf8'), dir + testCase);
    var hasErrors = false;
    fs.writeFileSync(dir + testCase.replace(/\.jade$/, '.actual.json'),
                     result.map(JSON.stringify).join('\n'));

    try {
      assert.deepEqual(expected, result);
    } catch (ex) {
      console.error(ex + '\n');
      hasErrors = true;
    }
  }
});

if (hasErrors) throw new Error('Some test cases failed');

var edir = __dirname + '/errors/';

fs.readdirSync(edir).forEach(function (testCase) {
  if (/\.jade$/.test(testCase)) {
    console.dir(testCase);
    var expected = JSON.parse(fs.readFileSync(edir + testCase.replace(/\.jade$/, '.json'), 'utf8'));
    var actual;
    try {
      lex(fs.readFileSync(edir + testCase, 'utf8'), edir + testCase);
      throw new Error('Expected ' + testCase + ' to throw an exception.');
    } catch (ex) {
      if (!ex || !ex.code || !ex.code.indexOf('JADE:') === 0) throw ex;
      actual = {
        msg: ex.msg,
        code: ex.code,
        line: ex.line
      };
    }
    assert.deepEqual(expected, actual);
  }
});
