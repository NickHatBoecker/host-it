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
 * Hack to read file with utf-8 encoding.
 *
 * @param string filePath
 */
export async function getFileContent (filePath) {
    return await readFile(filePath, {encoding: 'utf-8'});
}

/**
 * Get virtual host path from local storage
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
    const command = 'apachectl restart';
    sudo.exec(command, sudoOptions, function(error, stdout, stderr) {
        if (error) {
            console.log(error);
            return;
        }

        alert('Restarted Apache');
    });
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
 * @param string message
 * @param string type
 */
export function showAlert(message, type) {
    console.log(message);
}
