'use strict';
const Generator = require('yeoman-generator');
const _ = require('lodash');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {

  prompting() {
    this.log(
      yosay(`Put some ${chalk.red('goop')} on it!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'projectname',
        message: 'What is the name of this project?',
        default: 'test'
      },
      {
        type: 'input',
        name: 'packagepath',
        message: 'The go project path',
        default: 'github.com/rossedman'
      },
      {
        type: 'list',
        name: 'project',
        message: 'What type of application do you want to create?',
        choices: [
          {
            name: 'Empty Console Application',
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
      this.packagePath = props.packagepath;
      this.projectName = props.projectname;
    });
  }

  writing() {

    // sets defaults, but can be overridden
    this._setupDirectories();
    this._copyAdditionalFiles();

    // install project specific files
    switch (this.projectType) {

      // console app
      case 'console':
        this.fs.copyTpl(
          this.templatePath('console/_Gopkg.toml'),
          this.destinationPath('Gopkg.toml'),
          { projectname: this.projectName }
        );
        this.fs.copyTpl(
          this.templatePath('console/cmd/_root.go'),
          this.destinationPath('cmd/root.go'),
          { projectname: this.projectName }
        );
        this.fs.copyTpl(
          this.templatePath('console/_main.go'),
          this.destinationPath('main.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        break;

      // kubernetes controller
      case 'controller':
        this.fs.copyTpl(
          this.templatePath('controller/_Gopkg.toml'),
          this.destinationPath('Gopkg.toml'),
          { projectname: this.projectName }
        );
        this.fs.copyTpl(
          this.templatePath('controller/cmd/_root.go'),
          this.destinationPath('cmd/root.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/_main.go'),
          this.destinationPath('main.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/cmd/_controller.go'),
          this.destinationPath('cmd/controller.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        this.fs.copyTpl(
          this.templatePath('controller/pkg/controller/_controller.go'),
          this.destinationPath('pkg/controller/controller.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        break;

      // grpcapi
      case 'grpcapi':
        this.fs.copy(
          this.templatePath('grpcapi/Brewfile'),
          this.destinationPath('Brewfile')
        );
        this.fs.copy(
          this.templatePath('api/*'),
          this.destinationPath('api')
        );
        this.fs.copyTpl(
          this.templatePath('grpcapi/client/_main.go'),
          this.destinationPath('grpcapi/client/main.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        this.fs.copyTpl(
          this.templatePath('grpcapi/server/_main.go'),
          this.destinationPath('grpcapi/server/main.go'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
          }
        );
        // overwrite default Makefile
        this.fs.copyTpl(
          this.templatePath('grpcapi/_Makefile'),
          this.destinationPath('grpcapi/Makefile'),
          {
            projectname: this.projectName,
            packagepath: this.packagePath
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
      { projectname: this.projectName }
    );

    // Copy Docker file
    this.fs.copyTpl(
      this.templatePath('_Dockerfile'),
      this.destinationPath('Dockerfile'),
      {
        projectname: this.projectName,
        packagepath: this.packagePath
      }
    );

    // Copy Makefile file
    this.fs.copyTpl(this.templatePath('_Makefile'), this.destinationPath('Makefile'), {
      projectname: this.projectName,
    });

    // Copy README file
    this.fs.copyTpl(
      this.templatePath('_readme.md'),
      this.destinationPath('README.md'),
      { projectname: this.projectName }
    );

    // Copy cibuild file
    this.fs.copyTpl(
      this.templatePath('_cibuild'),
      this.destinationPath('scripts/cibuild'),
      { projectname: this.projectName }
    );
  }
};
