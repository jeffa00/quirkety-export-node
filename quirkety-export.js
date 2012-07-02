/* **************************************************
 * Quirkety Export: Node.js flavor
 *
 * ©2012 Jeff Ammons
 *
 * Quirkety is a half-baked blog thing that stores it's
 * meta data as json and it's content as either markdown or html.
 *
 * It uses mustache for templating.
 *
 * This module spins through the metadata and content and
 * spits out a static website.
 *
 * This is my first attempt with Node, so don't
 * expect the code to look great. In fact, expect
 * it to look horrifying.
 * *********************************************** */

var fs = require('fs'); // filesystem library
var siteInfo = "";      // JSON file with site specific meta-data
var templates = [];     // List of available templates 
var lvl = 0;            // Indentation level used during recursion

var sourceDir;          // Base directory where the "magic" happens.

/* ***************************************************
 *
 * SourceDir/
 *     ant-build-script <- HTML5 Boilerplate build script
 *     site-data <- Structure via dirs and json + md or html
 *     site-static-elements <- images, scripts, etc.
 *     template  <- Base HTML with Mustache place holders
 *     www       <- Output directory suitable for publishing (almost)
 *  ************************************************** */

var processFile = function(path, fileName, level) {
    /* *************************************************************
     * Recursively traverse through all the directories and files
     * found at the path and process them.
     *
     * Processing means to see if the file is a JSON file. If so
     * load it and see if it has an md or html file, with it.
     *
     * If so then see if the JSON file specifies a template and
     * pull a copy of that template. Else pull the default.
     *
     * Replace mustache placeholders with md or html contents.
     *
     * ************************************************************** */
    var levelPadding = '';

    for (var j = 0; j < level; j++)
    {
        levelPadding += '    ';
    }

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
            //console.log(levelPadding + 'Test: ' + pathArr[pathArr.length - 1]);
            if (siteInfo.StaticDirectories.indexOf(pathArr[pathArr.length - 1]) > -1){
                console.log(levelPadding + 'Static Dir');
            }else{
                processFile(thisFileName + '/', '', level + 1);
            }
        } else {
            if(thisFileName.substr(-5) == '.json') {
                console.log(levelPadding + 'Found a json file: ' + thisFileName);
            }else {
                console.log(levelPadding + 'Found a different file: ' + thisFileName);
            }
        }
    }
}

var loadTemplates = function(path) {
    /* *************************************************************
     * Load template files up into an array so we only
     * have to load them once per run.
     * ************************************************************* */
    var templates = [];
    var templateFileList= fs.readdirSync(path);
    for(var i=0; i < templateFileList.length; i++) {
        var fileName = templateFileList[i];
        if (fileName.indexOf('.html') > 0 && fileName.indexOf('template') > 0)
        {
            var keyName = fileName.substring(0, fileName.indexOf('-'));
            var fileContents = fs.readFileSync(path + fileName, 'utf8');
            templates[keyName] = fileContents; 
        }
    }
    return templates;
}

/* Begin processing *********************************
 * */

// If a dir was passed in, use it, else report error and bail.
if (process.argv[2]) {
    sourceDir = process.argv[2].replace('\\','/');
    siteInfo = JSON.parse(fs.readFileSync(sourceDir + '/site-data/site.json', 'utf8'));
    templates = loadTemplates(sourceDir + '/template/');
    console.log(siteInfo.Title);
    console.log('');
    processFile(sourceDir + '/site-data/', '', lvl);
} else {
    console.log('You must specify a source directory');
    return; 
}


