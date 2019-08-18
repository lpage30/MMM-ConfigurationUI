# MMM-ConfigurationUI
This is meant to be used to host a configuration UI for MagicMirror. Each Module should should have some page or definition on how to update their configuration. That definition should be assimilated into this UI.

# Approach
The MMM-ConfigurationUI contains: 
- an Angular server to provide the actual UI for configuration changing.
- REST API hosted to allow read/write/restart of MagicMirror configuration

## Module Startup:
- node_helper establishes the REST API hooks.
- node_helper spawns a child process executing `ng serve --host --port`; the angular Configuration UI Server.
- Module sends a Message to node_helper that is is 'up'. node_helper sends message to module to refresh only if angular server is up and running.
- Whenever the angular server is up and running we send a message to module to refresh its server.
- The angular webapp is hosted in an IFRAME on MagicMirror (similar to calendar and others)

## Configuration UI Server (Angular server)
The angular server operates and is constructed like any other server. It knows about the rest APIs hosted by the Module's node_helper, and uses them to read and write the module configurations.  

After reading the module configurations, the initial web page will be a menu of each module that can be configured.  

The user selects the module which navigates them to a form generated for that specific module definition and values.  

This form is created using the read module configuration and a specification hosted in the Module's directory. This allows any module to customize how they allow users to alter their configuration. If the module does not provide a specification, a simple generic form will be rendered with entries for all fields in that module's configuration.


# dependencies
* angular cli: `sudo npm install -g @angular/cli` (note requires node 10.9+)
* You may need to upgrade NPM and node

# setup
1. copy over module into MagicMirror/modules directory
11. add following css class style to `MagicMirror/css/custom.css`
```
    .MMMConfigurationUI {
        position: absolute;
        top: 30;
        left: 20;
        width: 90%;
        height: 100%;
        margin: 0 0 0 2em;
        display: inline-flex;
    }
```
111. npm install the module

# Initial Angular Project was Generated
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.0.2.
[Notes](https://adrianmejia.com/angular-2-tutorial-create-a-crud-app-with-angular-cli-and-typescript/)


## Further Angular help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
