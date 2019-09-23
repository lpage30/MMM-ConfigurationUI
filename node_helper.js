
const bodyParser = require("body-parser");
const NodeHelper = require("node_helper");
const { spawn } = require('child_process');
const cors = require('cors');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const ConfigFile = require('./configfile');
const {CONFIG_SERVER_RUNNING,  HOST_ADDRESS, MM_PORT,
    MMM_CONFIGURATION_UI_PORT,  MMM_MODULES_DIR, MMM_THIS_MODULE_NAME, MODULE_STARTED} = require('./application_paths');
const MAGICMIRROR_URI = `http://${HOST_ADDRESS}:${MM_PORT}`;
  
function updateAppSettingsJson() {
    const appSettingsJSONFile = path.join(MMM_MODULES_DIR, MMM_THIS_MODULE_NAME, 'src/assets/appsettings.json')
    const currentSettings = JSON.parse(readFileSync(appSettingsJSONFile, 'utf8'))
    if (currentSettings.configModuleURI !== MAGICMIRROR_URI) {
        const newSettings = Object.assign(currentSettings, {
            configModuleURI: MAGICMIRROR_URI
        });
        writeFileSync(appSettingsJSONFile, JSON.stringify(newSettings, null, 1));
    }
}
module.exports = NodeHelper.create({

    socketNotificationReceived: function(notification) {
		if (notification === MODULE_STARTED) {
            this.moduleStarted = true;
            if (this.configUIServerRunning) {
                this.sendSocketNotification(CONFIG_SERVER_RUNNING);
            }
		}
	},

    // Subclass start method.
    start: function () {
        this.moduleStarted = false;
        this.configUIServerRunning = false;
        this.configFile = new ConfigFile();

        updateAppSettingsJson();
        this.expressApp.use(bodyParser.urlencoded({ extended: true }))
        this.expressApp.use(bodyParser.json())
        this.expressApp.use(cors());
        console.log("Starting node helper for: " + this.name);
        this.expressApp.get('/configurations', (req, res) => {
            console.log('GET-REQUEST all')
            this.configFile.getConfig()
                .then(config => {
                    res.status(200).send({success: true, modules: config.modules });
                })
                .catch(error => {
                    console.error('FAILED GET CONFIGURATION', error)
                    res.status(500).send({success: false, error});
                });
        });
        this.expressApp.get('/configuration/:name', (req, res) => {
            const name = req.params.name
            console.log(`GET-REQUEST ${name}`)
            this.configFile.getConfig()
                .then(config => {
                    const module = config.modules.find(module => module.module === name)
                    if (module) {
                        res.status(200).send({success: true, module });
                    } else {
                        console.error(`${name} Not Found`, name, config.modules)
                        res.status(404).send({succes: false, error: new Error(`${name} not found`)})
                    }
                })
                .catch(error => {
                    console.error(`FAILED GET CONFIGURATION ${name}`, error)
                    res.status(500).send({success: false, error});
                });
        });
        // updates all the configs
        this.expressApp.put('/configurations', (req, res) => {
            console.log('PUT-REQUEST all')
            const modules = req.body
            const promises = modules.forEach(module => {
                return this.configFile.putModuleConfig(module)
            })
            Promise.all(promises)
                .then(() => {
                    this.configFile.putConfig()
                        .catch(error => {
                            console.error('FAILED PUTTING CONFIGURATION', error)
                            res.status(500).send({success: false, error});
                        })
                        .then(() => {
                            res.status(200).send({success: true });
                        });
                })
                .catch(error => {
                    console.error('FAILED UPDATING MODULE CONFIG', error)
                    res.status(400).send({success: false, error});
                });
        });
        // updates the config
        this.expressApp.put('/configuration', (req, res) => {
            const module = req.body
            const name = module.module
            console.log(`PUT-REQUEST ${name}`, module)
            this.configFile.putModuleConfig(module)
             .then(() => {
                    this.configFile.putConfig()
                        .catch(error => {
                            console.error(`FAILED PUTTING CONFIGURATION ${name}`, error)
                            res.status(500).send({success: false, error});
                        })
                        .then(() => {
                            res.status(200).send({success: true });
                        });
                })
                .catch(error => {
                    console.error(`FAILED UPDATING MODULE CONFIG ${name}`, error)
                    res.status(400).send({success: false, error});
                });
        });
        this.expressApp.get('/specification/:name', (req, res) => {
            const name = req.params.name
            console.log(`GET-SPECIFICATION-REQUEST ${name}`)
            ConfigFile.getConfigurationSpecification(name)
                .then(spec => {
                    if (spec) {
                        res.status(200).send({ success: true, spec })
                    } else {
                        console.error(`${name} Not Found`)
                        res.status(404).send({ success: false, error: new Error(`${name} specification not found`)})
                    }
                })
                .catch(error => {
                    console.error(`FAILED GET SPECIFICATION ${name}`, error)
                    res.status(500).send({success: false, error});
                });
        });
        this.expressApp.get('/canrebuild/:name', (req, res) => {
            const name = req.params.name
            console.log(`GET-CAN-REBUILD-REQUEST ${name}`)
            ConfigFile.canRebuild(name)
                .then(result => {
                    if (result) {
                        res.status(200).send({ success: true })
                    } else {
                        res.status(404).send({ success: false })
                    }
                })
                .catch(error => {
                    console.error(`FAILED GET CAN REBUILD ${name}`, error)
                    res.status(500).send({success: false, error});
                });
        });

        this.expressApp.post('/rebuild/:name', (req, res) => {
            const name = req.params.name
            console.log(`POST-REBUILD-REQUEST ${name}`)
            ConfigFile.rebuild(name)
                .then(result => {
                    if (result) {
                        res.status(200).send({ success: true })
                    } else {
                        console.error(`${name} cannot be rebuilt`)
                        res.status(404).send({ success: false, error: new Error(`${name} does not have a build option`)})
                    }
                })
                .catch(error => {
                    console.error(`FAILED POST REBUILD ${name}`, error)
                    res.status(500).send({success: false, error});
                });

        });
        this.expressApp.get('/canrestart/:name', (req, res) => {
            const name = req.params.name
            console.log(`GET-CAN-RESTART-REQUEST ${name}`)
            ConfigFile.canRestart(name)
                .then(result => {
                    if (result) {
                        res.status(200).send({ success: true })
                    } else {
                        res.status(404).send({ success: false })
                    }
                })
                .catch(error => {
                    console.error(`FAILED GET CAN RESTART ${name}`, error)
                    res.status(500).send({success: false, error});
                });
        });
        this.expressApp.post('/restart/:name', (req, res) => {
            const name = req.params.name
            console.log(`POST-RESTART-REQUEST ${name}`)
            ConfigFile.restart(name)
                .then(result => {
                    if (result) {
                        res.status(200).send({ success: true })
                    } else {
                        console.error(`${name} cannot be restarted`)
                        res.status(404).send({ success: false, error: new Error(`${name} does not have a restart option`)})
                    }
                })
                .catch(error => {
                    console.error(`FAILED POST RESTART ${name}`, error)
                    res.status(500).send({success: false, error});
                });
        });
        // Start angular server for Module
        this.configurationUIServer = spawn(
            'ng',
            ['serve', '--host', HOST_ADDRESS, '--port', MMM_CONFIGURATION_UI_PORT],
            {
                cwd: __dirname, 
            },
        );
        const nodeHelper = this;
        this.configurationUIServer.stdout.on('data', data => {
            if (data.indexOf(`listening on ${HOST_ADDRESS}:${MMM_CONFIGURATION_UI_PORT}`) > -1) {
                nodeHelper.configUIServerRunning = true;
                nodeHelper.sendSocketNotification(CONFIG_SERVER_RUNNING);
            }
            console.info(`ConfigUIServer> ${data}`)
        });
        this.configurationUIServer.on('error', err => console.error('ConfigUIServer error.', err))
        this.configurationUIServer.on('exit', (code, signal) => {
            console.error(`ConfigUIServer exit> ${code} ${signal}`);
        })
        console.log(`Started MMM-ConfigurationUI at ${HOST_ADDRESS}:${MMM_CONFIGURATION_UI_PORT}`);
    },
    stop: function () {
        if (this.configurationUIServer) {
            this.configurationUIServer.kill();
        }
    }
});

