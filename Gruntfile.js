module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');
  grunt.initConfig({
    pkg: pkg,
    browserify: {
      dist: {
        files: {
          'dist/barn.js': ['index.js']
        },
        options: {
          browserifyOptions: {
            standalone: 'Barn'
          }
        },
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: {
          'dist/barn.min.js': ['dist/barn.js']
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        updateConfigs: ['pkg'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        commitFiles: ['package.json', 'bower.json'],
        createTag: true,
        tagName: '%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: 'origin',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: false
      }
    },
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bump');

  grunt.registerTask('build', ['browserify', 'uglify']);
  grunt.registerTask('default', ['build']);
};
