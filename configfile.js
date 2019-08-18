const { readFile, writeFile } = require('fs');
const path = require('path');
const { promisify } = require('util');

const MMM_MODULES_DIR = path.join(__dirname, '../../..');
const MMM_CONFIG_FILE = path.join(MMM_MODULES_DIR, '../config/config.js');
const readFileAsync = promisify(readFile);
const writeFileAsync = promisify(writeFile);

/**
 * load configfile
 * @returns {
 *  prefix: string[],  - lines preceding exported config definition
 *  config: {}, - the exported config definition
 *  suffix: string[], - lines after the exported config definition
 * }
 */
async function readConfigfile() {
    const fileBlob = await readFileAsync(MMM_CONFIG_FILE, 'utf-8');
    const prefix = [];
    const suffix = [];
    const lines = fileBlob.split(/\r?\n/);
    let configVarNest = undefined;
    lines.forEach(line => {
      if (configVarNest === undefined) {
        if (line.match(/^(var|const) config = {$/)) {
          configVarNest = 1;
        } else {
          prefix.push(line);
        }
      } else if (configVarNest === 0) {
        suffix.push(line);
      } else {
        Array.from(line).forEach(c => {
          if (c === '{') configVarNest += 1;
          if (c === '}') configVarNest -= 1;
        })
      }
    })
    delete require.cache[require.resolve(MMM_CONFIG_FILE)];
    const config = require(MMM_CONFIG_FILE);
    return {
        prefix,
        config,
        suffix,
    };
}
/**
 * write config file
 * @param {
 *  prefix: string[],  - lines preceding exported config definition
 *  config: {}, - the exported config definition
 *  suffix: string[], - lines after the exported config definition
 * } param0 
 */
async function writeConfigFile({ prefix, config, suffix }) {
    const configlines = stringify(config, null, '\t').split(/\r?\n/);
    configlines[0] = `var config = ${configlines[0]}`;
    configlines[configlines.length - 1] += ';';
    await writeFileAsync(MMM_CONFIG_FILE,
      `${config.prefix.join('\n')}\n${configlines.join('\n')}\n${config.suffix.join('\n')}\n`,
      'utf-8');
}
function iseModule(module) {
    return typeof module === 'object' &&
           module.module && typeof module.module === 'string' &&
           module.position && typeof module.position === 'string' &&
           module.config && typeof module.config === 'object';
}

class ConfigurationFile {

    constructor () {
        this.config = undefined;
    }
    async getConfig() {
        if (!this.config) {
            this.config = await readConfigfile();
        }
        return this.config.config;
    }
    async putConfig() {
        if (this.config) {
            await writeConfigFile(this.config);
            this.config = undefined;
        }
    }

    async putModuleConfig(moduleConfig) {
        if (!isModule(moduleConfig)) {
            throw new Error('invalid module object');
        }
        const config = await this.getConfig();
        const allOtherModules = config.modules.filter(module => module.module !== moduleConfig.module);
        if (allOtherModules.length == config.modules.length) {
            throw new Error(`NOT FOUND: ${moduleComfig.module}`);
        }
        this.config.modules = [...allOtherModules, moduleConfig];
    }
}
module.exports =  ConfigurationFile;
