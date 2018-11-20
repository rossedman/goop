'use strict';
const Generator = require('yeoman-generator');
const _ = require('lodash');
const chalk = require('chalk');
const yosay = require('yosay');
const path = require('path');

module.exports = class extends Generator {

  // dynamically gets path
  _getRepoUrl() {
    var destinationPath = process.env.LOCAL_PATH || this.destinationRoot();
    var repoUrl = '';
    var src = path.sep + 'src' + path.sep;
    var index = destinationPath.indexOf(src);
    if (index !== -1) {
      repoUrl = destinationPath.substring(index + src.length);
    }
    return repoUrl;
  }

  _getAppName(repoPath) {
    var appName = path.parse(repoPath);
    return appName.base
  }

  initializing() {
    this.repoUrl = this._getRepoUrl();
    this.appName = this._getAppName(this.repoUrl);
    this.IsContinue = this.repoUrl.length > 0;
  }

  prompting() {
    this.log(
      yosay(`Put some ${chalk.red('goop')} on it!`)
    );

    // do not continue if not in GOPATH
    if (!this.IsContinue) {
      this.log(
        `Goop generator will only generate project in '${chalk.red(
          'GOPATH/src/<YOUR_PROJECT>'
        )} directory'. Otherwise the generation will be stopped.`
      );
      return;
    }

    this.log(`Generating files in: ${chalk.blue(this.repoUrl)}`);
    this.log(`App name detected as: ${chalk.blue(this.appName)}`);

    const prompts = [
      {
        type: 'list',
        name: 'project',
        message: 'What type of application do you want to create?',
        choices: [
          {
            name: 'Console Application',
            value: 'console'
          },
          {
            name: 'K8s Controller',
            value: 'controller'
          },
          {
            name: 'K8s Operator (Controller + CRD)',
            value: 'operator'
          },
          {
            name: 'GRPC API Microservice',
            value: 'grpcapi'
          },
          {
            name: 'REST API Microservice',
            value: 'restapi'
          },
        ]
      },
    ];

    return this.prompt(prompts).then(props => {
      this.projectType = props.project;
    });
  }

  writing() {

    // if not in $GOPATH
    if (!this.IsContinue) return;

    // sets defaults, but can be overridden
    this._setupDirectories();
    this._copyAdditionalFiles();

    // install project specific files
    switch (this.projectType) {

      // console app
      case 'console':
        this.fs.copy(
          this.templatePath('console/Gopkg.toml'),
          this.destinationPath('Gopkg.toml')
        );
        this.fs.copyTpl(
          this.templatePath('_Makefile'),
          this.destinationPath('Makefile'),
          { projectname: this.appName }
        );
        this.fs.copyTpl(
          this.templatePath('console/cmd/_root.go'),
          this.destinationPath('cmd/root.go'),
          { projectname: this.appName }
        );
        this.fs.copyTpl(
          this.templatePath('console/cmd/_command.go'),
          this.destinationPath('cmd/command.go'),
          { projectname: this.appName }
        );
        this.fs.copyTpl(
          this.templatePath('console/_main.go'),
          this.destinationPath('main.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        break;

      // kubernetes controller
      case 'controller':
        this.fs.copy(
          this.templatePath('controller/Gopkg.toml'),
          this.destinationPath('Gopkg.toml')
        );
        this.fs.copyTpl(
          this.templatePath('_Makefile'),
          this.destinationPath('Makefile'),
          { projectname: this.appName }
        );
        this.fs.copyTpl(
          this.templatePath('controller/cmd/_root.go'),
          this.destinationPath('cmd/root.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/_main.go'),
          this.destinationPath('main.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/cmd/_controller.go'),
          this.destinationPath('cmd/controller.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/pkg/controller/_controller.go'),
          this.destinationPath('pkg/controller/controller.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        break;

      // grpcapi
      case 'grpcapi':
        this.fs.copy(
          this.templatePath('grpcapi/Gopkg.toml'),
          this.destinationPath('Gopkg.toml')
        );
        this.fs.copyTpl(
          this.templatePath('grpcapi/_Makefile'),
          this.destinationPath('Makefile'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        this.fs.copy(
          this.templatePath('grpcapi/Brewfile'),
          this.destinationPath('Brewfile')
        );
        this.fs.copy(
          this.templatePath('grpcapi/api/handler.go'),
          this.destinationPath('api/handler.go')
        );
        this.fs.copy(
          this.templatePath('grpcapi/api/service.proto'),
          this.destinationPath('api/service.proto')
        );
        this.fs.copyTpl(
          this.templatePath('grpcapi/client/_main.go'),
          this.destinationPath('client/main.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        this.fs.copyTpl(
          this.templatePath('grpcapi/server/_main.go'),
          this.destinationPath('server/main.go'),
          {
            projectname: this.appName,
            repopath: this.repoUrl
          }
        );
        break;

      // kubernetes operator pattern
      case 'operator':
        break;

      // simple restapi
      case 'restapi':
        break;

      // nothing
      default:
        this.log('nothing to do');
        break;
    }
  }

  _setupDirectories() {
    this.fs.copy(
      this.templatePath('.gitkeep'),
      this.destinationPath('pkg/.gitkeep')
    )

    this.fs.copy(
      this.templatePath('.gitkeep'),
      this.destinationPath('config/.gitkeep')
    )

    this.fs.copy(
      this.templatePath('.gitkeep'),
      this.destinationPath('docs/.gitkeep')
    )
  }

  _copyAdditionalFiles() {

    // Copy .editorconfig
    this.fs.copy(
      this.templatePath('.editorconfig'),
      this.destinationPath('.editorconfig')
    )

    // Copy gitignore file
    this.fs.copyTpl(
      this.templatePath('_gitignore'),
      this.destinationPath('.gitignore'),
      { projectname: this.appName }
    );

    // Copy Docker file
    this.fs.copyTpl(
      this.templatePath('_Dockerfile'),
      this.destinationPath('Dockerfile'),
      {
        projectname: this.appName,
        repopath: this.repoUrl
      }
    );

    // Copy README file
    this.fs.copyTpl(
      this.templatePath('_readme.md'),
      this.destinationPath('README.md'),
      { projectname: this.appName }
    );

    // Copy cibuild file
    this.fs.copyTpl(
      this.templatePath('_cibuild'),
      this.destinationPath('scripts/cibuild'),
      { projectname: this.appName }
    );
  }

  end() {
    if (!this.IsContinue) return;

    this.log('\n');
    // put end instructions here
  }
};
