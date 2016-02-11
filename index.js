#! /usr/bin/env node

'use strict';

var fs = require('fs');
var path = require('path');
var readline = require('readline');
var chalk = require('chalk');
var glob = require('glob');

var parseArgs = require('minimist');
var argv = parseArgs(process.argv.slice(2));

var fileArgs = argv._;

var installDirectory = path.dirname(require.main.filename);
var typosJson = path.join(installDirectory, 'typos.json');

if (typeof argv.typos !== 'undefined') {
  typosJson = argv.typos;
} else if(typeof argv.preset !== 'undefined') {
  typosJson = path.join(installDirectory, 'presets', `${argv.preset}.json`);
}

function loadTypos () {
  return new Promise(function (resolve, reject) {
    fs.readFile(typosJson, 'utf8', function (err, contents) {
      resolve(JSON.parse(contents));
    });
  });
}

function scanFileForTypos (file, typos) {
  return new Promise(function (resolve, reject) {
    var lineReader = readline.createInterface({
      input: fs.createReadStream(file)
    });
    let lineNumber = 1;
    let typosFound = [];
    lineReader.on('line', function (line) {
      for (var i = 0; i < typos.length; i++) {
        var pattern = `\\b${typos[i].typo}\\b`;

        if (new RegExp(pattern, 'g').test(line)) {
          typosFound.push({
            file: file,
            lineNumber: lineNumber,
            typo: typos[i].typo,
            lineText: line,
            correction: typos[i].correction
          });
        }
      }

      lineNumber++;
    });

    lineReader.on('close', function () {
      resolve(typosFound);
    });
  });
}

function getFilesFromGlobPatterns (patterns) {
  let promises = [];

  for (let i = 0; i < patterns.length; i++) {
    promises.push(new Promise(function (resolve, reject) {
      glob(patterns[i], { nodir: true }, function (err, filesMatching) {
        resolve(filesMatching);
      });
    }));
  }

  return Promise.all(promises).then(function (fileGroups) {
    return new Promise(function (resolve, reject) {
      let concatenatedFiles = [];
      for (let f = 0; f < fileGroups.length; f++) {
        concatenatedFiles = concatenatedFiles.concat(fileGroups[f]);
      }

      resolve(concatenatedFiles);
    });
  });
}

function highlightTypo (text, typo) {
  let typoIndex = text.indexOf(typo);
  let preTypo = text.substring(0, typoIndex);
  let postTypo = text.substring(typoIndex + typo.length);

  return preTypo + chalk.bold.red(typo) + postTypo;
}

loadTypos().then(function (typos) {
  getFilesFromGlobPatterns(fileArgs).then(function (filesMatching) {
    let promises = [];

    for (let i = 0; i < filesMatching.length; i++) {
      promises.push(scanFileForTypos(filesMatching[i], typos));
    }

    Promise.all(promises).then(function (result) {
      let concatenatedResults = [];
      for (let i = 0; i < result.length; i++) {
        concatenatedResults = concatenatedResults.concat(result[i]);
      }

      for (var i = 0; i < concatenatedResults.length; i++) {
        let result = concatenatedResults[i];
        console.log(chalk.bold.yellow('file: ') + result.file);
        console.log(chalk.bold.yellow('line number: ') + result.lineNumber);
        console.log(chalk.bold.yellow('suggestion: ') + result.correction);
        console.log(chalk.bold.yellow('line: '));
        console.log(highlightTypo(result.lineText, result.typo));
        console.log();
      }
    });
  });
});
