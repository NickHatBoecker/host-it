<template>
    <v-dialog v-model="showSettingsModal" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar dark color="blue darken-3">
                <v-btn icon dark @click="$emit('close'); virtualhostsPathInput = getVirtualhostPath()">
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
                    <p color="grey">
                        Please provide absolute path to virtualhost directory. You can find more information on
                        <a @click="openUrl('https://github.com/theskyliner/host-it/')">gitHub</a>.
                    </p>
                    <v-text-field
                        v-model="virtualhostsPathInput"
                        label="Absolute path to virtualhost directory"
                        box
                    ></v-text-field>

                    <select-file-button
                        title="Choose folder..."
                        :selectedCallback="onSelectedVirtualhostPath"
                    ></select-file-button>
                </div>

                <div>
                    <v-text-field
                        v-model="errorLogInput"
                        label="Absolute path to default error_log"
                        box
                    ></v-text-field>
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
</template>

<script>
import SelectFileButton from '../SelectFileButton';
import { getDefaultErrorLogPath, getVirtualhostPath, openUrl, restartApache, setDefaultErrorLogPath, setVirtualhostPath } from "../../mixins/helpers.js";

export default {
    name: 'DialogSettings',

    components: { SelectFileButton },

    props: {
        showSettingsModal: Boolean,
    },

    data: function () {
        return {
            virtualhostsPathInput: getVirtualhostPath(),
            errorLogInput: getDefaultErrorLogPath(),
        }
    },

    methods: {
        getVirtualhostPath,
        restartApache,
        openUrl,

        saveSettings () {
            setVirtualhostPath(this.virtualhostsPathInput);
            setDefaultErrorLogPath(this.errorLogInput);
            this.$emit('save');
        },

        onSelectedVirtualhostPath (file) {
            if (!file) {
                return;
            }

            this.virtualhostsPathInput = file.path;
        }
    },
}
</script>
