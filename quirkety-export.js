/* **************************************************
 * Quirkety Export: Node.js flavor
 *
 * ©2012 Jeff Ammons
 *
 * Quirkety is a half-baked blog thing that stores its
 * meta data as json and its content as either markdown or html.
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

var fs        = require('fs'), // filesystem library
    pathLib   = require('path'), // path library
    mu        = require('mu2'), // Mustache templating library
    mkd       = require('marked'), // Marked markdown library
    wrench    = require('wrench'), // Wrench file library
    util      = require('util'), 
    siteInfo  = "",     // JSON file with site specific meta-data
    templates = [],     // List of available templates 
    lvl       = 0,      // Indentation level used during recursion
    sourceDir,          // Base directory where the "magic" happens.
    currentDate = new Date,
    copyrightYear = currentDate.getFullYear();

/* ***************************************************
 *
 * SourceDir/
 *     ant-build-script <- HTML5 Boilerplate build script <- Optional
 *     site-data <- Structure via dirs and json + md or html
 *     site-static-elements <- images, scripts, etc.
 *     template  <- Base HTML with Mustache place holders
 *     www       <- Output directory suitable for publishing (mostly)
 *  ************************************************** */

var processFile = function(basePath, path, fileName, level) {
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
                if (thisFileName.indexOf('/www') === -1) {
                    var newDirName = thisFileName.replace('site-data','www');

                    fs.mkdirSync(newDirName);
                    processFile(basePath, thisFileName + '/', '', level + 1);
                }
            }
        } else {
            if(thisFileName.substr(-5) == '.json') {
                // If we have a JSON file, we should see if we can match
                // it with an md or html file, then apply the template
                console.log(levelPadding + 'Found a json file: ' + thisFileName);

                try {
                    var pageMetaData = JSON.parse(fs.readFileSync(thisFileName, 'utf8'));
                    pageMetaData.copyrightYear = copyrightYear.toString();
                    
                    if (pageMetaData.SummarizeDir)
                    {
                        // **************************************************************
                        // Go fetch the contents of any directories listed this way
                        //
                        // If we put a tag for SummarizedContent in our template,
                        // mustache will render it out.
                        //
                        // To be really, really useful this should page the data,
                        // but I don't really need that at the moment.
                        var summaryData = loadSummaries(pageMetaData.SummarizeDir);
                        pageMetaData.SummarizedContent = summaryData;
                    }
                    var baseName = pathLib.basename(thisFileName, '.json');

                    var matchingFileList = fs.readdirSync(path);  

                    for (var matchIdx=0; matchIdx < matchingFileList.length; matchIdx++) {
                        var matchFile = path + matchingFileList[matchIdx];

                        var matchFileStat = fs.statSync(matchFile);
                        if (matchFile != thisFileName && 
                                matchFileStat.isFile &&
                                matchFile.indexOf(baseName) > 0 &&
                                matchFile.substr(-4) != '.swp' &&
                                matchFile.substr(-4) != '.swo' &&
                                matchFile.substr(-1) != '~') {
                                    var baseMatchFileName = pathLib.basename(matchFile);
                                    var fileExt = pathLib.extname(matchFile);

                                    var keyName = baseMatchFileName.replace(baseName,'');
                                    keyName = keyName.replace(pathLib.extname(keyName),'');
                                    keyName = keyName.replace('-','');

                                    var matchFileContents = fs.readFileSync(matchFile, 'utf8'); 

                                    // If it's .md, then run it through the markdown processor
                                    if ( fileExt == '.md') {
                                        matchFileContents = mkd(matchFileContents);
                                    }
                                    pageMetaData[keyName] = matchFileContents;
                                }
                    }

                    if (!pageMetaData.template) {
                        pageMetaData.template = 'default';
                    }

                    var thisTemplate = templates[pageMetaData.template];

                    var newFileName = thisFileName.replace('site-data','www').replace('json','html');;

                    var renderStream = mu.renderText(thisTemplate, pageMetaData, {});

                    var writeStream = fs.createWriteStream(newFileName);
                    util.pump(renderStream, writeStream);
                } catch (err) {
                    console.log(levelPadding + 'Error: ' + err);
                }

            }else {
                // What happened? Why am I here?
            }
        }
    }
}

var loadSummaries = function(path){
    // Stub here.
    // The plan is to spin through the directory passed in and
    // pull in the summary from each .json file, then
    // pass it through the markdown converter and return
    // the concatenated list
    //
    return 'Sample Data here';
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
        if (fileName.indexOf('.html') > 0 && fileName.indexOf('template') > 0 && fileName.indexOf('~') < 1) {
            var keyName = fileName.substring(0, fileName.indexOf('-'));
            var fileContents = fs.readFileSync(path + fileName, 'utf8');
            templates[keyName] = fileContents; 
        }
    }
    return templates;
}

var moveStaticContent = function(basePath){
    wrench.copyDirSyncRecursive(basePath + '/site-static-elements/', basePath + '/www/.');    
}

var deleteExistingExportDir = function(basePath) {
    wrench.rmdirSyncRecursive(basePath + '/www', true);
}

/* Configure marked *********************************
 * */
var configureMarked = function() {
    mkd.setOptions({
        gfm: true,
    pedantic: false,
    sanitize: false,
    highlight: function(code, lang) {
        if (lang === 'js') {
            return javascriptHighlighter(code);
        }
        return code;
    }
    });
}

var createExportDir = function(basePath){
    if (!fs.existsSync(basePath + '/www'))
    {
        fs.mkdirSync(basePath + '/www');
    }
/*
    fs.existsSync(basePath + '/www', function (exists) {
        if (!exists) {
            fs.mkdirSync(basePath + '/www');
        }
    });
*/
}

/* Begin processing *********************************
 * */

// If a dir was passed in, use it, else report error and bail.
if (process.argv[2]) {
    sourceDir = process.argv[2].replace('\\','/');

    // ******* Process optional params
    //
      
    configureMarked();
    siteInfo = JSON.parse(fs.readFileSync(sourceDir + '/site-data/site.json', 'utf8'));
    templates = loadTemplates(sourceDir + '/template/');
    console.log(siteInfo.Title);
    console.log('');
    deleteExistingExportDir(sourceDir);
    createExportDir(sourceDir); 
    moveStaticContent(sourceDir);
    processFile(sourceDir, sourceDir + '/site-data/', '', lvl);
} else {
    console.log('You must specify a source directory');
    return; 
}


