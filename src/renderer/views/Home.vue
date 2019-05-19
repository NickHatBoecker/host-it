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
            <virtualhost-table
                :virtualhosts="virtualhosts"
                @doAction="doAction"
            ></virtualhost-table>
        </v-container>

        <dialog-settings
            :showSettingsModal="showSettingsModal"
            @close="showSettingsModal = false"
            @save="onSaveSettings"
        ></dialog-settings>

        <!-- @TODO outsource dialog -->
        <v-dialog v-model="showEditModal" fullscreen hide-overlay transition="dialog-bottom-transition">
            <v-card>
                <v-toolbar dark color="blue darken-3">
                    <v-btn icon dark @click="closeEditModal()">
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
    import DialogSettings from '../components/dialogs/Settings';
    import VirtualhostTable from '../components/VirtualhostTable';
    import { getFileContent, getVirtualhostPath, restartApache } from "../mixins/helpers.js";

    const DEFAULT_ERROR_LOG = '/var/log/apache2/error_log';

    const { exec } = require('child_process');
    const fs = require('fs');

    export default {
        name: 'home',

        components: { DialogSettings, VirtualhostTable },

        data: function () {
            return {
                virtualhosts: [],
                showSettingsModal: false,
                virtualhostsPath: '',

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
            if (getVirtualhostPath()) {
                this.virtualhostsPath = getVirtualhostPath();
                this.fetch();
            } else {
                this.showSettingsModal = true;
            }
        },

        methods: {
            getVirtualhostPath,
            restartApache,

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
                        getFileContent(filePath).then(vhostString => {
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

            saveVirtualhost () {
                if (!this.formServername || !this.formDocumentroot) {
                    return;
                }

                if (this.currentVirtualhost) {
                    this.updateVirtualhost();
                } else {
                    this.saveNewVirtualhost();
                }

                this.closeEditModal();
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
                        showAlert(error, 'danger');
                    } else {
                        showAlert('Virtualhost successfully added. <a @click="restartApache()">Restart Apache now</a>.', 'success');
                    }
                });

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

            closeEditModal () {
                this.showEditModal = false;
                this.currentVirtualhost = null;

                this.formServername = "";
                this.formDocumentRoot = "";
                this.formCustomErrorLog = true;
            },

            onSaveSettings () {
                this.showSettingsModal = false;
                this.virtualhostsPath = getVirtualhostPath();
                this.fetch();
            },
        },
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
