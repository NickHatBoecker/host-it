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

        <dialog-edit-virtualhost
            :showEditModal="showEditModal"
            @close="showEditModal = false; currentVirtualhost = null;"
            @save="showEditModal = false; currentVirtualhost = null; fetch()"
        ></dialog-edit-virtualhost>
    </div>
</template>

<script>
    import Vue from 'vue';
    import DialogEditVirtualhost from '../components/dialogs/EditVirtualhost';
    import DialogSettings from '../components/dialogs/Settings';
    import VirtualhostTable from '../components/VirtualhostTable';
    import { getFileContent, getVirtualhostPath, restartApache, showAlert } from "../mixins/helpers.js";

    const DEFAULT_ERROR_LOG = '/var/log/apache2/error_log';

    const { exec } = require('child_process');
    const fs = require('fs');

    export default {
        name: 'home',

        components: { DialogEditVirtualhost, DialogSettings, VirtualhostTable },

        data: function () {
            return {
                virtualhosts: [],
                virtualhostsPath: '',
                currentVirtualhost: null,

                showSettingsModal: false,
                showEditModal: false,
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

                        exec('open '+DEFAULT_ERROR_LOG, function (error) {
                            if (error) {
                                console.log(error);
                                showAlert('Default error_log under "/var/log/apache2/error_log" does not exist.')
                            }
                        });
                        break;
                    default:
                        error.log('action not available: '+action);
                        break;
                }
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
