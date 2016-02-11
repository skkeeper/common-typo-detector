#! /usr/bin/env node

'use strict';

var readline = require('readline');
var fs = require('fs');

var lineReader = readline.createInterface({
  input: fs.createReadStream('common_misspellings_wikipedia.txt')
});

var words = [];
lineReader.on('line', function (line) {
  let parts = line.split('->');
  words.push({
    typo: parts[0],
    correction: parts[1]
  });
});

lineReader.on('close', function () {
  fs.writeFile('typos.json', JSON.stringify(words, null, 2), function (err) {
    console.log('done.');
  });
});
