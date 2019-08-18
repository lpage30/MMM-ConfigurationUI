const MagicMirrorRoot = __dirname.substring(0, __dirname.indexOf('MagicMirror') + 11);
const { CONFIG_SERVER_RUNNING, HOST_ADDRESS, MMM_CONFIGURATION_UI_PORT, MODULE_STARTED } = require(`${MagicMirrorRoot}/modules/MMM-ConfigurationUI/application_paths`)
const CONFIGURATION_UI_URL = `http://${HOST_ADDRESS}:${MMM_CONFIGURATION_UI_PORT}`;

Module.register('MMM-ConfigurationUI', {
	// Default module config.
	defaults: {
		updateInterval: 0,
	},
	refresh: function () {
		this.render = !this.hidden;
		this.updateDom();
	},
	start: function() {
		this.sendSocketNotification(MODULE_STARTED);
	},
	socketNotificationReceived: function(notification) {
		if (notification === CONFIG_SERVER_RUNNING) {
			console.log("ConfigUIServer is up: REFRESHING MODULE");
			this.render = !this.hidden;
			this.updateDom();
		}
	},
	getDom: function () {
		var configFrame = document.createElement("iframe");
		configFrame.setAttribute('src', CONFIGURATION_UI_URL);
		if (this.config.cssClassname) configFrame.className = this.config.cssClassname;
		return configFrame;
	},
/*
	resume: function () {
		this.render = true;
		this.updateDom();
		startIntervalUpdate(this)
	},

	suspend: function () {
		this.render = false;
		this.updateDom();
	},

	start: function () {
//		window.console.log(`Start: ${this.name}[${this.identifier}]`);
		this.render = !this.hidden;
		this.updateDom();
		startIntervalUpdate(this);
	},
	stop: function () {
//		window.console.log(`Stop: ${this.name}[${this.identifier}]`);
		stopIntervalUpdate(this)
	},

	getDom: function () {
		if (!this.render) {
			return document.createElement('div');
		}
		var webview = document.createElement("webview");
		webview.setAttribute('src', this.config.getURL());
		if (this.config.cssClassname) webview.className = this.config.cssClassname;
//		window.console.log(`getDom: ${this.name}[${this.identifier}]  ${webview.outerHTML}`);
		return webview;
    },
    */
});

