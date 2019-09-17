# MMM-ConfigurationUI
This is meant to be used to host a configuration UI for MagicMirror. This module loads the config.js for MagicMirror and collects and presents the names of the modules configured in that file. 

The forms to edit each of these module configurations are created based on 2 possible options.

* The module provides a specification json file for their configuration. This file would describe the fields their data types, and tooltip descriptions.

* The module's configuration as found in config.js is used to generate a specification. When a specification cannot be found the module's existing configuration is used to generate a specification which thne gets rendered as a data entry form.

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
The angular server operates and is constructed like any other angular server. It knows about the rest APIs hosted by the Module's node_helper, and uses them to read and write the module configurations.  

After reading the module configurations, the initial web page will be a menu of each module that can be configured.  

The user selects the module which navigates them to a form generated for that specific module definition and values.  

This form is created using the read module configuration and a specification hosted in the Module's directory. This allows any module to customize how they allow users to alter their configuration. If the module does not provide a specification, a simple generic form will be rendered with entries for all fields in that module's configuration.


# setup
1. copy over module into MagicMirror/modules directory
2. add following css class style to `MagicMirror/css/custom.css`
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
3. npm install the module
4. configuration
`/MagicMirror/config/config.js` Module configuration:
```
    {
        module: 'MMM-ConfigurationUI',
        position: 'fullscreen_above',
        config: {
                cssClassname: 'MMMConfigurationUI', // style to use for iframe; must be in custom.css
        },
    }
```

# Module Configuration Specification
In order to provide a more meaningful configuration UI for a module, the module can provide a specification for its configuration. This specification is a JSON file named `mmm-configuration-ui-specfile.json` in your module directory.

## JSON format:
For every field named `<field-name>` you can specify one of 3 specifications
1. field as scalar type. This covers the following types: `string, number, boolean` **or** `array of string, number or boolean`
```
{ 
    "<field-name>": "<field-scalar-data-type>" | ["<field-scalar-data-type>"]
    "<field-name>_description": "tooltip description  of <fieldname>"
}
```
2. field as object type This covers a single or array of object field specifications. The `{}` should contain a specification as described in this JSON format.
```
{ 
    "<field-name>": {} | [{}]
    "<field-name>_description": "tooltip description of <fieldname>"
}
```
3. field as picklist type.This covers a field that has a fixed number of choices, or a picklist.
```
{
    "<field-name>_picklist": [
        "<item1>", ... , "<itemN>"
        ],
    "<field-name>_description": "tooltip description of <fieldname>"
}
```
### example
A module configuration may look like this:
```
{ 
    cssClassname: 'some-class-name',
    listeningPort: 6002,
    showHelp: true,
    position: 'left',
    margins: [0, 1, 2, 3],
    details: {
        ipaddress: '127.0.0.1',
    },
    files: [
        {
            file: 'somefile',
            type: 'txt',
        },
        {
            file: 'otherfile',
            type: 'csv',
        }
    ]
}
```
A specification for this configuration:
```
{ 
    "cssClassname": "string",
    "listeningPort": "number",
    "listeningPort_description": "port bound to listen for incoming data",
    "showHelp": "boolean",
    "position_picklist": ["left", "right", "top", "bottom"],
    "margins": ["number"],
    "margins_description": "left, right top bottom margins",
    "details": {
        "ipaddress": "string"
    },
    "details_description": "detailed connection information",
    "files": [
        {
            "file": "string",
            "type_picklist": ["txt", "csv", "js"],
        }
    ],
    "defaultFile": {
        "file": "string",
        "type_picklist": ["txt", "csv", "js"],
    },
    "defaultFile_description": "default file to upload"
}
```

### Sample Render
![configuration ui form][./sample-screen.png]

