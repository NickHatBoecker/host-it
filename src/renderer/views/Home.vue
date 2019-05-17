<template>
    <div data-app>
        <v-toolbar color="blue darken-3" dark app fixed>
            <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
                <span class="hidden-sm-and-down">Host-it!</span>
            </v-toolbar-title>
            <v-btn small depressed flat color="white">
                Refresh list <v-icon right @click="fetch()" title="Refresh virtualhost list">refresh</v-icon>
            </v-btn>
            <v-btn small depressed flat color="white">
                Restart Apache <v-icon right @click="restartApache()" title="Restart Apache">refresh</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon>
                <v-icon @click="showEditModal = true" title="Add virtualhost">add</v-icon>
            </v-btn>
            <v-btn icon>
                <v-icon @click="showSettingsModal = true" title="Go to settings">settings</v-icon>
            </v-btn>
        </v-toolbar>

        <v-container>
            <!-- @TODO outsource table -->
            <v-data-table
                    :headers="headers"
                    :items="virtualhosts"
                    hide-actions
                    item-key="name"
                    class="mt--large"
            >
                <template v-slot:items="props">
                    <td class="c-virtualhost text-xs-left title">
                        <a @click="openUrl(`http://${props.item.name}`)" title="Open">
                            {{ props.item.name }}
                        </a>
                    </td>
                    <td class="text-xs-right">
                        <v-menu bottom left>
                            <template v-slot:activator="{ on }">
                                <v-btn icon v-on="on">
                                    <v-icon>more_vert</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-tile v-for="(item, i) in actions" :key="i" @click="doAction(item.id, props.item)">
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </template>
            </v-data-table>
        </v-container>

        <!-- @TODO outsource dialog -->
        <v-dialog v-model="showSettingsModal" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="blue darken-3">
                    <v-btn icon dark @click="showSettingsModal = false; virtualhostsPathInput = virtualhostsPath">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>Settings</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark flat @click="saveSettings()">Save</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-container>
                    <div>
                        <p color="grey">Please provide absolute path to virtualhost directory. You can find more information on <a @click="openUrl('https://github.com/theskyliner/host-it/')">gitHub</a>.</p>
                        <!-- @TODO file selection -->
                        <v-text-field
                            v-model="virtualhostsPathInput"
                            placeholder="Absolute path to virtualhost directory..."
                            solo
                        ></v-text-field>

                        <upload-button title="Choose folder..." :selectedCallback="onSelectVirtualhostPath"></upload-button>
                    </div>
                    <div>
                        <h3>Helpers</h3>
                        <div class="mt">
                            <v-btn color="blue" dark @click="restartApache()">
                                Restart Apache now
                            </v-btn>
                        </div>
                    </div>
                </v-container>
            </v-card>
        </v-dialog>

        <!-- @TODO outsource dialog -->
        <v-dialog v-model="showEditModal" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="blue darken-3">
                    <v-btn icon dark @click="showEditModal = false; currentVirtualhost = null">
                        <v-icon>close</v-icon>
                    </v-btn>
                    <v-toolbar-title>
                        {{ currentVirtualhost ? 'Edit Virtualhost' : 'Add Virtualhost' }}
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn dark flat @click="saveVirtualhost()">Save</v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-container>
                    <v-form v-model="virtualhostIsValid">
                        <v-text-field
                            v-model="formServername"
                            label="ServerName"
                            placeholder="domain.test"
                            :rules="formRules"
                            required
                        ></v-text-field>
                        <v-text-field
                            v-model="formDocumentroot"
                            label="DocumentRoot"
                            placeholder="/var/www/domain.test"
                            :rules="formRules"
                            required
                        ></v-text-field>
                        <v-checkbox
                            v-model="formCustomErrorLog"
                            label="Create custom error.log in DocumentRoot"
                        ></v-checkbox>

                        <v-textarea
                            box
                            label="Virtualhost Preview"
                            :value="getVirtualhostString()"
                            rows="12"
                            readonly
                        ></v-textarea>
                    </v-form>
                </v-container>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import Vue from 'vue';
    import UploadButton from '../components/UploadFileButton';

    const STORAGE_VIRTUALHOSTS_PATH = 'nhb_hostit.virtualhosts_path';
    const DEFAULT_ERROR_LOG = '/var/log/apache2/error_log';

    const sudo = require('sudo-prompt');
    const sudoOptions = {
        name: 'Host it',
    };

    const { exec } = require('child_process');
    const fs = require('fs');
    const util = require('util');

    // Convert fs.readFile into Promise version of same
    const readFile = util.promisify(fs.readFile);

    export default {
        name: 'home',

        data: function () {
            return {
                loader: null,
                loading: [],
                virtualhosts: [],
                headers: [
                    { text: 'Virtualhost', value: 'name', class: 'title' },
                    { text: 'Actions', value: 'actions', class: 'title', sortable: false, align: 'right' },
                ],
                showSettingsModal: false,
                virtualhostsPath: '',
                virtualhostsPathInput: '',
                actions: [
                    { "id": "edit", "title": "edit" },
                    //{ "id": "editm", "title": "edit manually" },
                    { "id": "remove", "title": "remove" },
                    { "id": "errorlog", "title": "open error.log" },
                ],

                currentVirtualhost: null,
                showEditModal: false,
                virtualhostIsValid: false,
                formServername: "",
                formDocumentroot: "",
                formCustomErrorLog: true,
                formRules: [
                    v => !!v || 'Field is required',
                ],
            }
        },

        mounted: function () {
            if (localStorage.getItem(STORAGE_VIRTUALHOSTS_PATH)) {
                this.virtualhostsPath = localStorage.getItem(STORAGE_VIRTUALHOSTS_PATH);
                this.virtualhostsPathInput = this.virtualhostsPath;
                this.fetch();
            } else {
                this.showSettingsModal = true;
            }
        },

        methods: {
            saveSettings () {
                localStorage.setItem(STORAGE_VIRTUALHOSTS_PATH, this.virtualhostsPathInput);
                this.virtualhostsPath = this.virtualhostsPathInput;
                this.showSettingsModal = false;

                this.fetch();
            },

            async fetch () {
                const that = this;

                // Reset
                that.virtualhosts = [];

                if (!that.virtualhostsPath) {
                    return;
                }

                fs.readdir(that.virtualhostsPath, 'utf8', function(error, files) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    files.forEach(function (file) {
                        var filePath = `${that.virtualhostsPath}/${file}`;
                        that.getFileContent(filePath).then(vhostString => {
                            const virtualhost = that.string2Virtualhost(vhostString, filePath);
                            if (!virtualhost) {
                                return;
                            }
                            that.virtualhosts.push(virtualhost);
                        });
                    });
                });
            },

            string2Virtualhost (string, filePath) {
                // Remove whitespace and newlines
                string = string.replace(/\s/g, "");

                let pattern = /DocumentRoot\"(.*)\"ServerName(.*?)</;

                let matches = string.match(pattern);
                if (!matches || !matches[1] || !matches[2]) {
                    return;
                }

                let virtualhost = {
                    "name": matches[2],
                    "documentRoot": matches[1],
                    "filePath": filePath,
                };

                pattern = /ErrorLog(.*?)</;
                matches = string.match(pattern);
                if (matches && matches[1]) {
                    virtualhost.errorLog = matches[1];
                }

                return virtualhost;
            },

            async getFileContent (filePath) {
                return await readFile(filePath, {encoding: 'utf-8'});
            },

            openUrl (url) {
                var shell = require('electron').shell;
                shell.openExternal(url);
            },

            doAction (action, virtualhost) {
                switch (action) {
                    case "edit":
                        this.currentVirtualhost = virtualhost;
                        this.showEditModal = true;
                        this.formServername = this.currentVirtualhost.name;
                        this.formDocumentroot = this.currentVirtualhost.documentRoot;
                        break;
                    case "editm":
                        this.currentVirtualhost = virtualhost;
                        // @TODO editm
                        break;
                    case "remove":
                        exec('rm '+virtualhost.filePath);
                        this.fetch();
                        break;
                    case "errorlog":
                        if (virtualhost.errorLog && fs.existsSync(virtualhost.errorLog)) {
                            exec('open '+virtualhost.errorLog);
                            break;
                        }

                        exec('open '+DEFAULT_ERROR_LOG);
                        break;
                    default:
                        error.log('action not available: '+action);
                        break;
                }
            },

            restartApache () {
                const command = 'apachectl restart';
                sudo.exec(command, sudoOptions, function(error, stdout, stderr) {
                    if (error) {
                        console.log(error);
                        return;
                    }

                    alert('Restarted Apache');
                });
            },

            saveVirtualhost () {
                if (!this.formServername || !this.formDocumentroot) {
                    return;
                }

                if (this.currentVirtualhost) {
                    this.updateVirtualhost();
                } else {
                    this.saveNewVirtualhost();
                }

                this.formServername = "";
                this.formDocumentroot = "";
                this.formCustomErrorLog = true;
            },

            updateVirtualhost () {
                // Remove old file
                exec('rm '+this.currentVirtualhost.filePath);

                // Save new file
                this.saveNewVirtualhost();
                this.currentVirtualhost = null;
            },

            saveNewVirtualhost () {
                const that = this;
                const vhostPath = this.virtualhostsPath.replace(/\/$/, "") + "/" + this.formServername;

                fs.writeFile(vhostPath, this.getVirtualhostString(), function (error) {
                    if (error) {
                        that.showAlert(error, 'danger');
                    } else {
                        that.showAlert('Virtualhost successfully added. <a @click="restartApache()">Restart Apache now</a>.', 'success');
                    }
                });

                this.showEditModal = false;
                this.fetch();
            },

            getVirtualhostString () {
                let string = "";
                string += "<VirtualHost *:80>\n\tDocumentRoot \""+this.formDocumentroot+"\"\n";
                string += "\tServerName "+this.formServername+"\n";
                string += "\n\t<Directory "+this.formDocumentroot+">\n";
                string += "\t\tOptions FollowSymlinks Indexes\n\t\tAllowOverride All\n\t\tRequire all granted\n";
                string += "\t</Directory>\n";

                if (this.formCustomErrorLog) {
                    string += "\n\tErrorLog "+this.formDocumentroot+"/error.log\n";
                }

                string += "</VirtualHost>";

                return string;
            },

            showAlert (message, type) {
                console.log(message);
            },

            onSelectVirtualhostPath (file) {
                this.virtualhostsPathInput = file.path;
            },
        },

        components: { UploadButton },
    }
</script>

<style lang="scss">
    html {
        height: 100%;
    }

    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }

    a {
        cursor: pointer;
        color: blue;
    }

    td:not(.c-virtualhost) a:hover {
        text-decoration: underline;
    }

    body { font-family: Arial, sans-serif; }

    .mt {
        margin-top: 12px;
    }

    .mt--large {
        margin-top: 48px;
    }

    .error--text {
        color: red !important;
    }
</style>
