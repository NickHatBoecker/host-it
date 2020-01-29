<template>
    <div v-if="virtualhosts.length">
        <v-data-table
            :headers="headers"
            :items="virtualhosts"
            hide-actions
            item-key="name"
            class="mt--medium"
        >
            <template v-slot:items="props">
                <td class="c-virtualhost text-xs-left title">
                    <a @click="openUrl(`http://${props.item.name}`)" title="Open in browser">
                        {{ props.item.name }}
                    </a>
                </td>
                <td class="text-xs-left title">
                    <small>{{ props.item.documentRoot }}</small>
                </td>
                <td class="text-xs-right">
                    <v-menu bottom left>
                        <template v-slot:activator="{ on }">
                            <v-btn icon v-on="on">
                                <v-icon>more_vert</v-icon>
                            </v-btn>
                        </template>
                        <v-list>
                            <v-list-tile v-for="(action, i) in actions" :key="i" @click="$emit('doAction', action.identifier, props.item)">
                                <v-list-tile-title>{{ action.title }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </td>
            </template>
        </v-data-table>
    </div>
    <p class="mt--large" v-else>No virtualhosts configured. But you can <a @click="$emit('add')">add one</a>.</p>
</template>

<script>
import { openUrl } from "../mixins/helpers.js";

export default {
    name: 'virtualhost-table',
    props: {
        virtualhosts: Array,
    },

    data: function () {
        return {
            headers: [
                { text: 'Virtualhost', value: 'name', class: 'title' },
                { text: 'DocumentRoot', value: 'documentRoot', class: 'title' },
                { text: 'Actions', value: 'actions', class: 'title', sortable: false, align: 'right' },
            ],

            // Dropdown actions per virtualhost
            actions: [
                { "identifier": "edit", "title": "edit" },
                { "identifier": "remove", "title": "remove" },
                { "identifier": "errorlog", "title": "open error.log" },
            ],
        }
    },

    methods: {
        openUrl,
    },
}
</script>

<style>
small {
    font-size: 12px;
}
</style>
