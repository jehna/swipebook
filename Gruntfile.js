module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            default: {
                files: {
                  "swipebook/css/style.css": "src/less/bootstrap.less"
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/**/*.less'],
                tasks: ['less', 'cssmin'],
                options: {
                  spawn: false,
                },
            },
            templates: {
                files: ['templates/*.html', 'src/html/**/*.html', 'src/html/*.html'],
                tasks: ['build'],
                options: {
                  spawn: false,
                },
            },
            javascript: {
                files: ['src/js/app/*.js', 'src/js/app/**/*.js'],
                tasks: ['jshint', 'uglify'],
                options: {
                  spawn: false,
                },
            }
        },
        htmlmin: {
            default: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true,
                    minifyJS: true
                },
                files: [{
                    expand: true,     // Enable dynamic expansion.
                    cwd: 'swipebook/',      // Src matches are relative to this path.
                    src: ['*.html', '**/*.html'], // Actual pattern(s) to match.
                    dest: 'swipebook/',   // Destination path prefix.
                    //ext: '.min.js',   // Dest filepaths will have this extension.
                    //extDot: 'first'   // Extensions in filenames begin after the first dot
                }],
            }
        },
        imagemin: {
            default: {
                files: [{
                    expand: true,
                    cwd: 'src/images/',
                    src: '*',
                    dest: 'swipebook/images/'
                }]
            }
        },
        cssmin: {
            default: {
                files: {
                    'swipebook/css/style.css': ['swipebook/css/style.css']
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'src/js/app/*.js', 'src/js/app/**/*.js']
        },
        uglify: {
            options: {
            },
            default: {
                files: [{
                    expand: true,
                    cwd: 'src/js',
                    src: '**/*.js',
                    dest: 'swipebook/js'
                }]
            }
        },
        sitemap: {
            dist: {
                siteRoot: 'swipebook/'
            }
        },
        robotstxt: {
            dist: {
                dest: 'swipebook/',
                policy: [{
                        sitemap: ['<%= pkg.homepage %>sitemap.xml']
                    },
                    {
                        crawldelay: 100
                    },
                    {
                        host: '<%= pkg.homepage %>'
                    }
                ]
            }
        },
        template: {}
    });
  
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-template');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-sitemap');
    grunt.loadNpmTasks('grunt-robots-txt');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.registerTask('build', 'build all files', function() {
        var pkg = grunt.file.readJSON('package.json');
        
        grunt.file.expand({ "cwd": "src/html" }, "./**/*.html")
        .map(function(filename) {
            return {
                "content": grunt.template.process(grunt.file.read("src/html/" + filename), { data: { basepath: pkg.basepath }}),
                "filename": filename
            };
        })
        .forEach(function(conf,i,a) {
            
            var pieces = conf.filename.split("/");
            pieces.shift();
            conf.current = pieces.length > 1 ? pieces[0] : null;
            conf.title = conf.current ? (conf.current.charAt(0).toUpperCase() + conf.current.slice(1)) : null;
            
            conf.basepath = pkg.basepath;
            
            var filename = "swipebook/" + conf.filename;
            var files = {};
            
            files[filename] = ['templates/basesite.html'];
            
            grunt.config('template.'+i+'.options.data', conf);
            grunt.config('template.'+i+'.files', files);
            
        });
        
        grunt.task.run(['template']);
        grunt.task.run(['htmlmin']);
        grunt.task.run(['sitemap']);
        grunt.task.run(['robotstxt']);
    });
    
    // Default task(s).
    grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify', 'build', 'imagemin', 'watch']);

};