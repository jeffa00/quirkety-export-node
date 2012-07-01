/* **************************************************
 * Quirkety Export: Node.js flavor
 *
 * Quirkety is a half-baked blog thing that stores it's
 * meta data as json and it's content as either markdown or html.
 *
 * It uses mustache for templating.
 *
 * This module spins through the metadata and content and
 * spits out a static website.
 *
 * *********************************************** */
var fs = require('fs');

var sourceDir, targetDir;

var swapSlashes = function(originalPath) {
    return originalPath.replace('\\', '/');
}

if (process.argv[2]) {
    sourceDir = swapSlashes(process.argv[2]);
}

if (process.argv[3]) {
    targetDir = swapSlashes(process.argv[3]);
}

var siteInfo = JSON.parse(fs.readFileSync(sourceDir + '/site-data/site.json', 'utf8'));

console.log(siteInfo.Title);
console.log('');

var processFile = function(path, fileName, level) {
    //console.log('Path: ' + path);
    //console.log('FileName: ' + fileName);
    var levelPadding = '';

    for (var j = 0; j < level; j++)
    {
        levelPadding += '    ';
    }

    //levelPaddingconsole.log(levelPadding + path + fileName + '*********');
    var fileList = fs.readdirSync(path + fileName);

    for (var i=0; i < fileList.length; i++) {
        var thisFileName = path + fileList[i];
        //console.log(levelPadding + 'Preparing to process: ' + thisFileName);
        if (thisFileName.substr(-4) == '.swp'){
            continue;
        }

        var stat = fs.statSync(thisFileName);

        if (stat.isDirectory()) {
            console.log(levelPadding + 'Processing Dir: ' + thisFileName);
            var pathArr = thisFileName.split("/");
            
            if (siteInfo.StaticDirectories.indexOf(pathArr[pathArr.length - 1]) > -1){
                console.log(levelPadding + 'Static Dir');
            }else{
                processFile(thisFileName + '/', '', level + 1);
            }
        } else {
            if(thisFileName.substr(-5) == '.json') {
                console.log(levelPadding + 'Found a json file: ' + thisFileName);
               
                var pageInfo = JSON.parse(fs.readFileSync(thisFileName, 'utf8'));

                if(pageInfo.title) {
                    console.log(levelPadding + pageInfo.title);
                }
                pageInfo = null;

            } else if (thisFileName.substr(-3) == '.md') {
                console.log(levelPadding + 'Found a markdown file: ' + thisFileName);
            } else if (thisFileName.substr(-5) == '.html') {
               console.log(levelPadding + 'Found an HTML file: ' + thisFileName);
            } else {
                console.log(levelPadding + 'Found a different file: ' + thisFileName);
            }
        }
    }
}

var lvl = 0;

processFile(sourceDir + '/site-data/', '', lvl);
