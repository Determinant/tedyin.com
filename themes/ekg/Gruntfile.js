module.exports = function(grunt) {
    var build_dir = './build';
    var src_dir = './src';
    function get_basename(flist) {
        return flist.map(function (cur, idx, arr) {
            return cur.replace(new RegExp('\.[^.]*$'), '');
        });
    }

    function gen_filename(prefix, ext, flist) {
        return flist.map(function (cur, idx, arr) {
            return prefix + '/' + cur + ext;
        });
    }

    function gen_mapping(ftype, src_ext, dest_ext, flist) {
        var mapping = {};
        flist.forEach(function (cur, idx, arr) {
            mapping[build_dir + '/' + ftype + '/' + cur + dest_ext] =
                src_dir + '/' + ftype + '/' + cur + src_ext;
        });
        return mapping;
    }
    var css_flist = ['normalize.css', 'pocketgrid.css', 'code.css', 'gist.css', 'theme.css'];
    var js_flist = ['all.js', 'jquery.mCustomScrollbar.js'];
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            options: {
                sourcemap: "none"
            },
            build: {
                files: {
                    'src/css/theme.css': 'src/css/theme.scss'
                }
            }
        },
        uglify: {
            build: {
                files: gen_mapping('js', '.js', '.min.js', get_basename(js_flist))
            }
        },
        concat: {
            css: {
                files: {
                    'build/css/all.min.css': gen_filename(build_dir + '/css', '.min.css', get_basename(css_flist))
                }
            }
        },
        cssmin: {
            fonts: {
                files: {'build/fonts/fonts.min.css': 'src/fonts/fonts.css'}
            },
            build: {
                files: gen_mapping('css', '.css', '.min.css', get_basename(css_flist))
            }
        },
        copy: {
            css: {
                options: {
                    timestamp: true
                },
                cwd: 'src/css/',
                src: '**/*.min.css',
                dest: 'build/css/',
                expand: true
            },
            js: {
                options: {
                    timestamp: true
                },
                cwd: 'src/js/',
                src: '**/*.min.js',
                dest: 'build/js/',
                expand: true
            },
            fonts: {
                options: {
                    timestamp: true
                },
                cwd: 'src/fonts/',
                src: '**/*.{svg,eot,ttf,woff}',
                dest: 'build/fonts/',
                expand: true
            },
            image: {
                options: {
                    timestamp: true
                },
                cwd: 'src/css/images/',
                src: '*',
                dest: 'build/css/images/',
                expand: true
            }
        },
        watch: {
            fonts: {
                files: ['src/fonts/**/*.{svg,eot,ttf,woff}'],
                tasks: ['copy:fonts']
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-newer');
    grunt.registerTask('default', ['newer:uglify', 'newer:sass', 'newer:cssmin', 'newer:copy', 'newer:concat']);
};
