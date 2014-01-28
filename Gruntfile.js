module.exports = function(grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            dist: {
                files: {
                    "build/islandFever.js": ["src/**/*.js"]
                }
            }
        },
        jshint: {
            files: ["Gruntfile.js", "src/**/*.js", "test/**/*.js"],
            options: {
                jshintrc: true
            }
        },
        watch: {
            files: ["<%= jshint.files %>"],
            tasks: ["default"]
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // grunt.registerTask("test", ["jshint", "qunit"]);

    grunt.registerTask("default", ["jshint", "browserify"]);
};