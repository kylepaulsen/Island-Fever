module.exports = function(grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            dist: {
                files: {
                    "build/<%= pkg.name %>.js": ["src/**/*.js"]
                },
                options: {
                    transform: ["brfs"]
                }
            }
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"dd-mm-yyyy\") %>\n" +
                    "Copyright Kyle Paulsen */\n"
            },
            dist: {
                files: {
                    "build/<%= pkg.name %>.min.js": ["build/<%= pkg.name %>.js"]
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
            files: ["<%= jshint.files %>", "html/**/*"],
            tasks: ["dev"]
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");

    // grunt.registerTask("test", ["jshint", "qunit"]);

    grunt.registerTask("dev", ["jshint", "browserify"]);
    grunt.registerTask("default", ["dev", "uglify"]);
};
