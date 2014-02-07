module.exports = function(grunt) {
    "use strict";
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        browserify: {
            src: {
                files: {
                    "build/<%= pkg.name %>.js": ["src/**/*.js"]
                },
                options: {
                    transform: ["brfs"]
                }
            },
            test: {
                files: {
                    "build/<%= pkg.name %>.test.js": ["test/spec/**/*.js"]
                }
            }
        },
        jasmine: {
            src: "build/<%= pkg.name %>.test.js"
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
            options: grunt.file.readJSON(".jshintrc"),
            src: {
                src: ["Gruntfile.js", "src/**/*.js"],
            },
            test: {
                src: ["test/**/*.js"],
                options: {
                    globals: {
                        it: false,
                        xit: false,
                        describe: false,
                        xdescribe: false,
                        beforeEach: false,
                        afterEach: false,
                        expect: false,
                        spyOn: false
                    }
                }
            }
        },
        watch: {
            files: ["src/**/*", "html/**/*"],
            tasks: ["dev"]
        }
    });

    grunt.loadNpmTasks("grunt-browserify");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-jasmine");

    grunt.registerTask("test", ["jshint", "browserify:test", "jasmine"]);

    grunt.registerTask("dev", ["jshint", "browserify:src"]);
    grunt.registerTask("default", ["dev", "uglify"]);
};
