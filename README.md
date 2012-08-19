#Quirkety Export - Node Version
Quirkety is a half-baked blog thing that stores its meta data as json and its content as either markdown or html.
 
It uses mustache for templating.
 
This is my first attempt with Node, so don't expect the code to look great. In fact, expect it to look horrifying.

## Why Would I Use This?
You probably wouldn't. There are a ton of great CMS apps and blog engines out there. Heck if nothing exisited but Word Press, I'd point you towards it instead of this.

The problem with all those apps is that they assemble web pages from static content and database records each time someone looks at the page (minus anything cacheing related you are doing, of course). Dynamic content like that takes time to assemble.

In most cases this is necessary, but not always.

Take for example my children's comic site http://funzietown.com. I doubt I'll be updating it any longer since it never caught on. At all. I still get a few hits a day, however, and a few sites link to my little math practice game that I did in Silverlight.

I don't need a database and bunch of overhead from PHP or .Net or Java just to serve that up.

Solution? Take the processor hit of combining content and template ONCE at "compile" time, rather that on each page hit.

## Oh, So The Idea Here Is...
Assemble the structure of your site with directories, write the content in Markdown, store meta-data in json and templates using Mustache.

Once you run Quirkety Export on the project, you can either FTP the static files to your webserver or use something like Git. 

## What Do I Do?
I'm assuming you have Node installed.

If not go to http://nodejs.org and get it.

Next get this project.

When you are ready to run it, just run this command:

    node quirkety-export <path to your source directory>

For example:

    node quirkety-export c:\myProject

## Whoa, What's All This About A Source Project Directory Thingy?
When you run Quirkety Export, it will spin through the directory you give it and do the following:

1. Read site-info.json file for site info. In json format. From a file.
2. Copy static elements to the www directory.
3. Load templates into memory
3. Spin through the site-data directory and all subdirectories
  1. Look for *.json files
  2. Look for matching files
  3. Processing md files into HTML
  4. Apply content to templates to generate output files
  5. Export HTML files to appropriate places

## What Goes In My Source Project Directory Thingy?
Basically three required directories, one optional directory, and a whole lot of json, md or html files.

     SourceDir/
       ant-build-script     <- HTML5 Boilerplate build script <- Optional
       site-data            <- Structure via dirs and json + md or html
       site-static-elements <- images, scripts, etc.
       template             <- Base HTML with Mustache place holders
       www                  <- Output directory suitable for publishing (mostly)

The important thing to remember is that your URL structure will be based on your directory structure in your site-data and site-static-elements directories.

In other words http://www.mysite.com/blog/my-first-blog-page would look like this:

    SourceDir/
        site-data/
            blog/
                index.json
                index-content.md

The result in the www folder will be:

    SourceDir/
        www/
            blog/
                index.html

That means both these URLs will work (if your web server considers index.html to be the default file):

http://www.mysite.com/blog/my-first-blog-page/
http://www.mysite.com/blog/my-first-blog-page/index.html


## How Does The File Naming Work?
When Quirkety Export encounters a json file, like index.json, it will read in the properties you enter like title, author, etc.

It will also look for related files like index-content.md.

It will read the md file in, run it through the markdown processor to generate HTML, then put it into the page object as a property called content.

That means you could have something like this:

    index.json
    index-content.md
    index-otherContent.md
    index-stillYetMoreContent.md

That would make properties called:

    content
    otherContent
    stillYetMoreContent

If you put those into your template like this:

    {{&content}}
    {{&otherContent}}
    {{&stillYetMoreContent}}

then the Mustache template engine will put the resulting HTML in those spots.

Notice the ampersand in there. That tells the Mustache engine to NOT HTML encode the output. Otherwise your HTML won't be HTML.

If you are inserting plain text, then you don't need the ampersand.

    {{title}} 

for instance.

This gives you quite a bit of freedom.

If you want to put "editor":"John Doh" in the index.json, then you can put {{editor}} in your HTML template and be away to the races.

Or you could create an index-editor.md file. You just couldn't do both successfully...
