const os = require('os');
const MMM_THIS_MODULE_NAME = 'MMM-ConfigurationUI'
const MMM_MODULES_DIR = `${__dirname.substring(0, __dirname.indexOf('MagicMirror') + 11)}/modules`

// port is obtained from MagicMirror/js/defaults.js
const { port: MM_PORT } = require('../../js/defaults');

const getHostAddress = () => {
	const addr = Object.values(os.networkInterfaces())
		.map(iface => iface
			.find(addr => addr.family === 'IPv4' && !addr.internal))
		.filter(addr => addr)[0];
	return addr ? addr.address : "localhost";
}

const MMM_CONFIGURATION_UI_PORT = 6060;
module.exports = {
    MMM_THIS_MODULE_NAME,
    MMM_MODULES_DIR,
    HOST_ADDRESS: getHostAddress(),
    MM_PORT,
    MMM_CONFIGURATION_UI_PORT,
    CONFIG_SERVER_RUNNING: 'CONFIG_SERVER_RUNNING',
    MODULE_STARTED: 'CONFIG_MODULE_STARTED',
}
