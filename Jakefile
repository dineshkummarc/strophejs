var jake = require('jake'),
    shrinksafe = require('minify/shrinksafe'),
file = require('file'),
    system = require('system'),
    filedir = require("jake").filedir,
    task = require("jake").task,
clean = require('jake/clean'),
os = require('os'),
    FileList = require("jake").FileList;

clean.CLEAN.include('**/#*#', '\.#*' , '**/\.tmp*',"**/\.*\.*\.swp");
clean.CLEAN.exclude('\.git');    //don't touch my .git directory!
clean.CLEAN.include('strophe.js');


filedir("strophe.js", new FileList("src/*.js"), function()
{
    var result = "";

    (new FileList("src/*.js")).forEach(function(filename)
    {
        result += shrinksafe.compress(file.read(filename));
    });

    file.write("strophe.js", result);
});

filedir("vendor", function() {
    file.mkdirs("vendor");
});

task("jquery", ["vendor"], function() {
    os.system("wget -q -O vendor/jquery.js http://code.jquery.com/jquery-latest.js");
});

task("qunit", ["vendor", "jquery"], function() {
    os.system('wget -q -O vendor/qunit.js http://github.com/jquery/qunit/raw/master/qunit/qunit.js');
    os.system('wget -q -O vendor/qunit.css http://github.com/jquery/qunit/raw/master/qunit/qunit.css');
});

task("jquery-xmlns", ["vendor"], function() {
    os.system('wget -q -O vendor/jquery.xmlns.js http://www.rfk.id.au/static/scratch/jquery.xmlns.js');    
});

task("test", ["qunit", "jquery-xmlns"]);

task("default", ["strophe.js"]);