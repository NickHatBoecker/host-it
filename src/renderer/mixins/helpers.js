const STORAGE_VIRTUALHOSTS_PATH = 'nhb_hostit.virtualhosts_path';

const sudoOptions = {
    name: 'Host it',
};

const sudo = require('sudo-prompt');

export function getVirtualhostPath() {
    return localStorage.getItem(STORAGE_VIRTUALHOSTS_PATH);
}

export function setVirtualhostPath(value) {
    localStorage.setItem(STORAGE_VIRTUALHOSTS_PATH, value);
}

export function openUrl(url) {
    require('electron').shell.openExternal(url);
}

export function showAlert(message, type) {
    console.log(message);
}

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
