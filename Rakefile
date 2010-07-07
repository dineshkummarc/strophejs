
require 'fileutils'

rhino = Hash.new
rhino[:jar] = "vendor/js.jar"
rhino[:zip] = "vendor/rhino.zip"
rhino[:version] = "1_7R2"
rhino[:download] = "ftp://ftp.mozilla.org/pub/mozilla.org/js/rhino#{rhino[:version]}.zip"
rhino[:cmd] = "java -cp #{rhino[:jar]} org.mozilla.javascript.tools.shell.Main -opt -1"
rhino[:debugger] = "java -cp #{rhino[:jar]} org.mozilla.javascript.tools.debugger.Main -opt -1"

file rhino[:zip] do
  FileUtils.mkdir("vendor")
  sh "wget #{rhino[:download]} -O #{rhino[:zip]}" 
end

file rhino[:jar] => [rhino[:zip]] do
  if not File.exists? rhino[:jar]
    sh "unzip -d vendor/ #{rhino[:zip]} rhino#{rhino[:version]}/js.jar"
    FileUtils.move("vendor/rhino#{rhino[:version]}/js.jar", rhino[:jar])
    FileUtils.rm_rf("vendor/rhino#{rhino[:version]}")
  end
end

SRC = FileList["src/*.js"]
TEST = FileList["tests/*.js"]
PLUGINS = FileList["plugins/*.js"]
LIB = Hash.new
LIB[:test] = FileList["tests/lib/*.js"]

VENDOR = {
  :main => {
  },
  :test => {
    "qunit" => {
      :url => "http://github.com/jquery/qunit/raw/master/qunit/qunit.js",
      :file => "qunit.js"
    },
    "jquery" => {
      :url => "http://code.jquery.com/jquery-latest.js",
      :file => "jquery.js"
    },
    "jack" => {
      :url => "http://github.com/keronsen/jack/raw/master/src/jack.js",
      :file => "jack.js"
    },
    "envjs" => {
      :url => "http://www.envjs.com/dist/env.rhino.1.2.js",
      :file => "env.js"
    },
  }
}

VENDOR.each_value do |deps|
  deps.each_pair do |key, value|
    file "vendor/#{value[:file]}" do
      puts "Downloading #{key} from #{value[:url]}"
      sh "wget -q -O vendor/#{value[:file]} #{value[:url]}"
    end
  end
end

DEPENDENCIES = Hash.new
DEPENDENCIES[:test] = VENDOR[:test].map { |key, value| "vendor/#{value[:file]}" }
DEPENDENCIES[:main] = VENDOR[:main].map { |key, value| "vendor/#{value[:file]}" }
DEPENDENCIES[:all] = DEPENDENCIES[:main] + DEPENDENCIES[:test]

def execute_test(command, filename)
  cmd = ""
  (DEPENDENCIES[:all] + LIB[:test] + SRC + PLUGINS + [filename]).each do |f|
    cmd << "load('#{f}');"
  end
  cmd << "window.location = '';"
  sh "echo \"#{cmd}\" | " + command   
end

task :test_file, [:filename] do |t, args|
  execute_test(rhino[:cmd], args.filename)
end

task :debug_test_file, [:filename] do |t, args|
  execute_test(rhino[:debugger], args.filename)
end

task :test => [rhino[:jar]] + DEPENDENCIES[:all] do |t, args|
  TEST.each do |file|
    execute_test(rhino[:cmd],file)
  end
end  

task :debug_test => [rhino[:jar]] + DEPENDENCIES[:all] do
  execute_test(rhino[:debugger], "tests/tests.js")
end  

task :default => [:test]

