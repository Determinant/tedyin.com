module.exports = function(grunt) {
    var build_dir = './build';
    var src_dir = './src';
    function gen_mapping(ftype, flist) {
        var mapping = {};
        for (var i = 0; i < flist.length; i++)
        {
            var base = flist[i].replace(new RegExp('\.' + ftype + '$'), '')
            mapping[build_dir + '/' + ftype + '/' + base + '.min.' + ftype] =
                        src_dir + '/' + ftype + '/'+ base + '.' + ftype;
        }
        return mapping;
    }
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
                files: gen_mapping('js', [
                    'all.js', 'jquery.jscrollpane.js'])
            }
        },
        cssmin: {
            fonts: {
                files: {'build/fonts/fonts.min.css': 'src/fonts/fonts.css'}
            },
            build: {
                files: gen_mapping('css', [
                    'code.css', 'rst.css', 'theme.css',
                    'gist.css', 'jquery.jscrollpane.css'])
            }
        },
        copy: {
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
    grunt.loadNpmTasks('grunt-newer');
    grunt.registerTask('default', ['newer:uglify', 'newer:sass', 'newer:cssmin', 'newer:copy']);
};
