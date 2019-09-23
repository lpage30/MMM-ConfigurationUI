const MagicMirrorRoot = __dirname.substring(0, __dirname.indexOf('MagicMirror') + 11);
const { spawn } = require('child_process');
const { readFile, writeFile, existsSync } = require('fs');
const path = require('path');
const { promisify } = require('util');
const { MMM_MODULES_DIR, MMM_THIS_MODULE_NAME } = r = require(`${MagicMirrorRoot}/modules/MMM-ConfigurationUI/application_paths`)

const MMM_CONFIG_FILE = path.join(MMM_MODULES_DIR, '../config/config.js');
const MM_SPECIFICATION_FILE = path.join(MMM_MODULES_DIR, `${MMM_THIS_MODULE_NAME}/src/assets/mmm-configuration-specification.json`)
const MM_PACKAGE_JSON = path.join(MMM_MODULES_DIR, '../package.json');
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
  console.log('READING ...', MMM_CONFIG_FILE)
  const fileBlob = await readFileAsync(MMM_CONFIG_FILE, 'utf-8');
  const prefix = [];
  const suffix = [];
  const lines = fileBlob.split(/\r?\n/);
  let configVarNest = undefined;
  lines.forEach(line => {
    if (configVarNest === undefined) {
      if (line.match(/^\s*(var|const)\s*config\s*=\s*{.*$/)) {
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
  const trimArray = (lines) => lines
    .map(line => line.trim())
    .filter((line, index) => line.length > 0 || ((index + 1) < lines.length && lines[index + 1].length > 0))
  delete require.cache[require.resolve(MMM_CONFIG_FILE)];
  const config = require(MMM_CONFIG_FILE);
  console.log('FINISHED READING', MMM_CONFIG_FILE)
  return {
      prefix: trimArray(prefix),
      config,
      suffix: trimArray(suffix),
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
  console.info('WRITING...', MMM_CONFIG_FILE, config);
  const configlines = JSON.stringify(config, null, '\t').split(/\r?\n/);
  configlines[0] = `var config = ${configlines[0]}`;
  configlines[configlines.length - 1] += ';';
  await writeFileAsync(MMM_CONFIG_FILE,
    `${prefix.join('\n')}\n${configlines.join('\n')}\n${suffix.join('\n')}\n`,
    'utf-8');
  console.log('FINISHED WRITING', MMM_CONFIG_FILE)
}
function getModuleDirectory(moduleName) {
  return moduleName.toLowerCase() === 'magicmirror' ? 
  path.join(MMM_MODULES_DIR, '..') : path.join(MMM_MODULES_DIR, moduleName);
}
async function getPackageJson(moduleName) {
  const moduledir = getModuleDirectory(moduleName);
  const packageJSON = path.join(moduledir, 'package.json');
  if (existsSync(packageJSON)) {
    const packageString = await readFileAsync(packageJSON, 'utf-8');
    return JSON.parse(packageString);
  }
  return undefined;
}
async function executeCommand(commandline) {
  return new Promise(resolve => {
    const child = spawn(commandline, { shell: true, detached: true });
    child.on('exit', () => resolve())
  })
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
        console.log('PUTTING MODULE CONFIG', moduleConfig.module)
        const config = await this.getConfig();
        const allOtherModules = config.modules.filter(module => module.module !== moduleConfig.module);
        if (allOtherModules.length == config.modules.length) {
            throw new Error(`NOT FOUND: ${moduleComfig.module}`);
        }
        config.modules = [...allOtherModules, moduleConfig];
        this.config.config = config
        console.log('FINISHED PUTTING MODULE CONFIG', moduleConfig.module)
    }

    static async getConfigurationSpecification(moduleName) {
      const configurationUISpecificationJSON = moduleName.toLowerCase() === 'magicmirror' ?
        MM_SPECIFICATION_FILE : path.join(MMM_MODULES_DIR, `${moduleName}/mmm-configuration-ui-specfile.json`)
      if (existsSync(configurationUISpecificationJSON)) {
        const moduleSpecificationString = await readFileAsync(configurationUISpecificationJSON, 'utf-8');
        return JSON.parse(moduleSpecificationString);
      }
      return undefined;
    }
    static async canRebuild(moduleName) {
      const packageJson = await getPackageJson(moduleName);
      return packageJson && packageJson.scripts && packageJson.scripts.build;
    }
    static async rebuild(moduleName) {
      const moduledir = getModuleDirectory(moduleName);
      const packageJson = await getPackageJson(moduleName);
      if (packageJson && packageJson.scripts && packageJson.scripts.build) {
        await executeCommand(`pushd ${moduledir} && npm run build; popd`);
        return true;
      }
      return false;
    }
    static async canRestart(moduleName) {
      const packageJson = await getPackageJson(moduleName);
      return packageJson && packageJson.scripts && packageJson.scripts.start;
    }
    static async restart(moduleName) {
      const moduledir = getModuleDirectory(moduleName);
      const packageJson = await getPackageJson(moduleName);
      if (packageJson && packageJson.scripts && packageJson.scripts.start) {
        await executeCommand(`pushd ${moduledir} && npm run start; popd`);
        if ('magicmirror' === moduleName) {
          process.exit(0)
        }
        return true;
      }
      return false;
    }
}
module.exports =  ConfigurationFile;
