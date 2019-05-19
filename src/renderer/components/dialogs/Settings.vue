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
                    <p color="grey">Please provide absolute path to virtualhost directory. You can find more information on <a @click="openUrl('https://github.com/theskyliner/host-it/')">gitHub</a>.</p>
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
</template>

<script>
import UploadButton from '../UploadFileButton';
import { getVirtualhostPath, openUrl, restartApache, setVirtualhostPath } from "../../mixins/helpers.js"

export default {
    name: 'dialog-settings',

    components: { UploadButton },

    props: {
        showSettingsModal: Boolean,
    },

    data: function () {
        return {
            virtualhostsPathInput: getVirtualhostPath(),
        }
    },

    methods: {
        getVirtualhostPath,
        restartApache,

        saveSettings () {
            setVirtualhostPath(this.virtualhostsPathInput);
            this.$emit('save');
        },

        onSelectVirtualhostPath (file) {
            if (!file) {
                return;
            }
            this.virtualhostsPathInput = file.path;
        },
    },
}
</script>
