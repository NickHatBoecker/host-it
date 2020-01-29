<template>
    <v-dialog v-model="showEditModal" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card>
            <v-toolbar dark color="blue darken-3">
                <v-btn icon dark @click="reset(); $emit('close')">
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
                        v-model="formDocumentRoot"
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
</template>

<script>
import { getVirtualhostPath, showAlert } from "../../mixins/helpers.js"

const { exec } = require('child_process');
const fs = require('fs');

const VHOST_FILE_EXTENSION = '.conf';

export default {
    name: 'DialogEditVirtualhost',

    props: {
        showEditModal: {
            type: Boolean,
            default: false,
            required: true,
        },
        currentVirtualhost: {
            default: [],
            required: true,
        },
    },

    data: function () {
        return {
            virtualhostIsValid: false,

            formServername: "",
            formDocumentRoot: "",
            formCustomErrorLog: false,

            formRules: [
                v => !!v || 'Field is required',
            ],
        }
    },

    methods: {
        reset () {
            this.formServername = "";
            this.formDocumentRoot = "";
            this.formCustomErrorLog = false;
        },

        saveVirtualhost () {
            if (!this.formServername || !this.formDocumentRoot) {
                return;
            }

            if (this.currentVirtualhost) {
                this.updateVirtualhost();
            } else {
                this.saveNewVirtualhost();
            }

            this.reset();
            this.$emit('save');
        },

        updateVirtualhost () {
            // Remove old file
            exec('rm '+this.currentVirtualhost.filePath);

            // Save new file
            this.saveNewVirtualhost();
        },

        saveNewVirtualhost () {
            const that = this;
            const vhostPath = getVirtualhostPath().replace(/\/$/, "") + "/" + this.formServername + VHOST_FILE_EXTENSION;

            fs.writeFile(vhostPath, this.getVirtualhostString(), function (error) {
                if (error) {
                    showAlert(error, 'danger');
                } else {
                    showAlert('Virtualhost successfully added. You have to restart Apache.', 'success');
                }
            });
        },

        getVirtualhostString () {
            let string = "";
            string += "<VirtualHost *:80>\n\tDocumentRoot \""+this.formDocumentRoot+"\"\n";
            string += "\tServerName "+this.formServername+"\n";
            string += "\n\t<Directory "+this.formDocumentRoot+">\n";
            string += "\t\tOptions FollowSymlinks Indexes\n\t\tAllowOverride All\n\t\tRequire all granted\n";
            string += "\t</Directory>\n";

            if (this.formCustomErrorLog) {
                string += "\n\tErrorLog "+this.formDocumentRoot+"/error.log\n";
            }

            string += "</VirtualHost>";

            return string;
        },
    },

    watch: { 
        currentVirtualhost: function(newVirtualhost, oldVirtualhost) {
            if (!newVirtualhost) {
                return;
            }

            console.log(newVirtualhost);

            this.formServername = newVirtualhost.name;
            this.formDocumentRoot = newVirtualhost.documentRoot;

            if (newVirtualhost.errorLog) {
                this.formCustomErrorLog = true;
            }
        }
    }
}
</script>
