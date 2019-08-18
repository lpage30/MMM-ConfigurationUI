
const NodeHelper = require("node_helper");
const bodyParser = require("body-parser");
const { spawn } = require('child_process');
const ConfigFile = require('./configfile');
const {CONFIG_SERVER_RUNNING,  HOST_ADDRESS, MMM_CONFIGURATION_UI_PORT,  MODULE_STARTED} = require('./application_paths');

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
        this.expressApp.use(bodyParser)
        console.log("Starting node helper for: " + this.name);

        this.expressApp.get('/configuration', (req, res) => {
            this.configFile.getConfig()
                .catch(error => {
                    res.status(500).send({success: false, error});
                })
                .then(config => {
                    res.status(200).send({success: true, modules: config.modules });
                });
        });

        // updates the the config
        this.expressApp.put('/configuration', (req, res) => {
            const { modules } = req.body
            const promises = modules.forEach(module => {
                return this.configFile.putModuleConfig(module)
            })
            Promise.all(promises)
                .catch(error => {
                    res.status(400).send({success: false, error});
                })
                .then(() => {
                    this.configFile.putConmfig()
                        .catch(error => {
                            res.status(500).send({success: false, error});
                        })
                        .then(() => {
                            res.status(200).send({success: true });
                        });
                })
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

