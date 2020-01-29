const DEFAULT_ERROR_LOG = '/var/log/apache2/error_log';

const STORAGE_DEFAULT_ERROR_LOG_PATH = 'nhb_hostit.default_error_log_path';
const STORAGE_VIRTUALHOSTS_PATH = 'nhb_hostit.virtualhosts_path';

const sudo = require('sudo-prompt');
const sudoOptions = {
    name: 'Host it',
};

// Convert fs.readFile into Promise version of same
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

/**
 * Get default error log path from local storage
 *
 * @return string
 */
export function getDefaultErrorLogPath () {
    if (!localStorage.getItem(STORAGE_DEFAULT_ERROR_LOG_PATH)) {
        return DEFAULT_ERROR_LOG;
    }
    return localStorage.getItem(STORAGE_DEFAULT_ERROR_LOG_PATH);
}

/**
 * Hack to read file with utf-8 encoding.
 *
 * @param string filePath
 */
export async function getFileContent (filePath) {
    return await readFile(filePath, {encoding: 'utf-8'});
}

/**
 * Get virtual host path from local storage
 *
 * @return string
 */
export function getVirtualhostPath() {
    return localStorage.getItem(STORAGE_VIRTUALHOSTS_PATH);
}

/**
 * Open URL in default browser
 *
 * @param string url
 */
export function openUrl(url) {
    require('electron').shell.openExternal(url);
}

/**
 * Restart apache with password prompt because of sudo
 */
export function restartApache() {
    const command = 'apachectl -k restart';
    sudo.exec(command, sudoOptions, function(error, stdout, stderr) {
        if (error) {
            console.log(error);
            return;
        }

        alert('Restarted Apache');
    });
}

/**
 * Set default error log path in local storage
 *
 * @param string path
 */
export function setDefaultErrorLogPath(path) {
    localStorage.setItem(STORAGE_DEFAULT_ERROR_LOG_PATH, path);
}

/**
 * Set virtual host path in local storage
 *
 * @param string path
 */
export function setVirtualhostPath(path) {
    localStorage.setItem(STORAGE_VIRTUALHOSTS_PATH, path);
}

/**
 * @TODO alert rendering
 *
 * @param string message
 * @param string type
 */
export function showAlert(message, type) {
    alert(message);
}

/**
 * Convert virtualhost string to virtualhost object
 *
 * @param string vhostString
 * @param string filePath
 */
export function string2Virtualhost (vhostString, filePath) {
    // Remove whitespace and newlines
    vhostString = vhostString.replace(/\s/g, "");

    let pattern = /DocumentRoot\"(.*)\"ServerName(.*?)</;

    let matches = vhostString.match(pattern);
    if (!matches || !matches[1] || !matches[2]) {
        return;
    }

    let virtualhost = {
        "name": matches[2],
        "documentRoot": matches[1],
        "filePath": filePath,
    };

    pattern = /ErrorLog(.*?)</;
    matches = vhostString.match(pattern);
    if (matches && matches[1]) {
        virtualhost.errorLog = matches[1];
    }

    return virtualhost;
}
