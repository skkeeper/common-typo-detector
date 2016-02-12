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
var typosJson = [];

if(typeof argv.typos === 'undefined' && typeof argv.preset === 'undefined') {
  typosJson.push(path.join(installDirectory, 'presets', 'en.json'));
}

if (typeof argv.typos !== 'undefined') {
  typosJson.push(argv.typos);
}

if(typeof argv.preset !== 'undefined') {
  typosJson.push(path.join(installDirectory, 'presets', `${argv.preset}.json`));
}

function loadTypos () {
  let promises = [];
  for(let i = 0; i < typosJson.length; i++) {
    promises.push(new Promise(function (resolve, reject) {
      fs.readFile(typosJson[i], 'utf8', function (err, contents) {
        resolve(JSON.parse(contents));
      });
    }));
  }

  return Promise.all(promises).then(function (jsons) {
    return new Promise(function (resolve, reject) {
      let concatenated = [];
      for(let j = 0; j < jsons.length; j++) {
        concatenated = concatenated.concat(jsons[j]);
      }

      resolve(concatenated);
    });
  });
}

function scanFileForTypos (file, typos) {
  return new Promise(function (resolve, reject) {
    let lineReader = readline.createInterface({
      input: fs.createReadStream(file)
    });
    let lineNumber = 1;
    let typosFound = [];
    lineReader.on('line', function (line) {
      for (let i = 0; i < typos.length; i++) {
        let pattern = `\\b${typos[i].typo}\\b`;
        let matchIndex = line.search(pattern);
        if (matchIndex > -1) {
          typosFound.push({
            file: file,
            lineNumber: lineNumber,
            charColumn: matchIndex + 1,
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

  if(text.length > 60) {
    // TODO: Improve what to include around the typo
    preTypo = preTypo.substring(preTypo.length - 40);
    postTypo = postTypo.substring(0, 10);
  }

  return preTypo + chalk.bold.red(typo) + postTypo;
}

loadTypos().then(function (typos) {
  getFilesFromGlobPatterns(fileArgs).then(function (filesMatching) {

    let concatenatedResults = [];
    var promise = Promise.resolve(null);

    filesMatching.forEach(function (value) {
      promise = promise.then(function () {
        return scanFileForTypos(value, typos);
      }).then(function (newValue) {
        concatenatedResults = concatenatedResults.concat(newValue);
      });
    });

    return promise.then(function (result) {
      for (let i = 0; i < concatenatedResults.length; i++) {
        let result = concatenatedResults[i];
        console.log();
        console.log(chalk.bold.yellow('file: ') + result.file);
        console.log(chalk.bold.yellow('line number: ') + result.lineNumber);
        console.log(chalk.bold.yellow('character column: ') + result.charColumn);
        console.log(chalk.bold.yellow('line: '));
        console.log(highlightTypo(result.lineText, result.typo));
        console.log(chalk.bold.yellow('suggestion: ') + result.correction);
      }

      if(concatenatedResults.length > 0) {
        process.exit(1);
      }
    });
  });
});
