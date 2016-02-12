#! /usr/bin/env node
/**
 * @file
 * Converts lists taken from wikipedia pages like this:
 * https://en.wikipedia.org/wiki/Wikipedia:Lists_of_common_misspellings/For_machines
 * into a JSON format that can be read by common-typo-detector.
 */

'use strict';

var readline = require('readline');
var fs = require('fs');

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

var inputFile = argv._[0];

var lineReader = readline.createInterface({
  input: fs.createReadStream(inputFile)
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
