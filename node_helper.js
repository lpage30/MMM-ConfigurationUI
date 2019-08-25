
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
        this.configFile = new ConfigFile()
        updateAppSettingsJson();
        this.expressApp.use(bodyParser.urlencoded({ extended: true }))
        this.expressApp.use(bodyParser.json())
        this.expressApp.use(cors())
        console.log("Starting node helper for: " + this.name);

        this.expressApp.get('/configuration', (req, res) => {
            console.log('GET-REQUEST')
            this.configFile.getConfig()
                .then(config => {
                    res.status(200).send({success: true, modules: config.modules });
                })
                .catch(error => {
                    console.error('FAILED GET CONFIGURATION', error)
                    res.status(500).send({success: false, error});
                });
        });

        // updates the the config
        this.expressApp.put('/configuration', (req, res) => {
            console.log('PUT-REQUEST')
            const { modules } = req.body
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

