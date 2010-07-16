var jake = require('jake'),
    shrinksafe = require('minify/shrinksafe'),
    read = require('file').read,
    write = require('file').write,
    system = require('system'),
    filedir = require("jake").filedir,
    task = require("jake").task,
    FileList = require("jake").FileList;

filedir("strophe.js", new FileList("src/*.js"), function()
{
    var result = "";

    (new FileList("src/*.js")).forEach(function(filename)
    {
        result += shrinksafe.compress(read(filename));
    });

    write("strophe.js", result);
});

task("default", ["strophe.js"]);