<template>
    <div data-app>
        <v-toolbar color="blue darken-3" dark app fixed>
            <v-toolbar-title style="width: 300px" class="ml-0 pl-3">
                <span class="hidden-sm-and-down">Host-it!</span>
            </v-toolbar-title>

            <v-btn small depressed flat color="white" @click="fetch()">
                Refresh list <v-icon right title="Refresh virtualhost list">refresh</v-icon>
            </v-btn>

            <v-btn small depressed flat color="white" @click="restartApache()">
                Restart Apache
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn icon>
                <v-icon @click="showEditModal = true" title="Add virtualhost">add</v-icon>
            </v-btn>

            <v-btn icon>
                <v-icon @click="showSettingsModal = true" title="Go to settings">settings</v-icon>
            </v-btn>
        </v-toolbar>

        <v-container fluid>
            <div class="mt--large c-search">
                <v-text-field
                    v-model="searchTerm"
                    filled
                    clearable
                    color="blue"
                    placeholder="Search"
                ></v-text-field>
            </div>

            <virtualhost-table
                :virtualhosts="filteredVirtualhosts"
                @doAction="doAction"
                @add="showEditModal = true"
            ></virtualhost-table>
        </v-container>

        <dialog-settings
            :showSettingsModal="showSettingsModal"
            @close="showSettingsModal = false"
            @save="onSaveSettings"
        ></dialog-settings>

        <dialog-edit-virtualhost
            :showEditModal="showEditModal"
            :currentVirtualhost="currentVirtualhost"
            @close="showEditModal = false; currentVirtualhost = null;"
            @save="showEditModal = false; currentVirtualhost = null; fetch()"
        ></dialog-edit-virtualhost>
    </div>
</template>

<script>
    import DialogEditVirtualhost from '../components/dialogs/EditVirtualhost';
    import DialogSettings from '../components/dialogs/Settings';
    import VirtualhostTable from '../components/VirtualhostTable';
    import { getDefaultErrorLogPath, getFileContent, getVirtualhostPath, restartApache, showAlert, string2Virtualhost } from "../mixins/helpers.js";

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

                searchTerm: '',
            }
        },

        computed: {
            filteredVirtualhosts: function () {
                const query = this.searchTerm.toLowerCase(); // Case insensitive filter
                const queryInTitleOrDocumentRoot = x => x.name.toLowerCase().includes(query) || x.documentRoot.toLowerCase().includes(query)

                return this.virtualhosts.filter(queryInTitleOrDocumentRoot)
            },
        },

        mounted: function () {
            if (getVirtualhostPath()) {
                this.virtualhostsPath = getVirtualhostPath();
                this.fetch();
            } else {
                // Show settings if no config file is configured yet.
                this.showSettingsModal = true;
            }
        },

        methods: {
            getVirtualhostPath,
            restartApache,

            /**
             * Fetch all configured virtualhosts from saved directory
             */
            fetch () {
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
                        var filePath = `${that.virtualhostsPath}${file}`;
                        getFileContent(filePath).then(vhostString => {
                            const virtualhost = string2Virtualhost(vhostString, filePath);
                            if (!virtualhost) {
                                return;
                            }
                            that.virtualhosts.push(virtualhost);
                        });
                    });
                });
            },

            /**
             * Execute dropdown action per virtualhost
             *
             * @param string action (edit|editm|remove|errorlog)
             * @param virtualhost
             */
            doAction (action, virtualhost) {
                switch (action) {
                    case "edit":
                        this.currentVirtualhost = virtualhost;
                        this.showEditModal = true;
                        break;

                    case "editm":
                        this.currentVirtualhost = virtualhost;
                        // @TODO editm: edit manually vhost string and add special needs
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

                        exec('open '+getDefaultErrorLogPath(), function (error) {
                            if (error) {
                                console.log(error);
                                showAlert(`Default error_log under "${ getDefaultErrorLogPath() }" does not exist.`)
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
    $spacing-unit: 12px;

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
        color: #1565c0;
    }

    td:not(.c-virtualhost) a:hover {
        text-decoration: underline;
    }

    body { font-family: Arial, sans-serif; }

    .mt {
        margin-top: $spacing-unit;
    }

    .mt--medium {
        margin-top: $spacing-unit*2;
    }

    .mt--large {
        margin-top: $spacing-unit*5;
    }

    .error--text {
        color: red !important;
    }

    .c-search .v-input__slot {
        background: rgba(0, 0, 0, .06);
        padding: $spacing-unit;
    }
</style>
