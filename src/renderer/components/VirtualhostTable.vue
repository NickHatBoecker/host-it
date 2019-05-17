<template>
    <div v-if="virtualhosts.length">
        <v-data-table
            :headers="headers"
            :items="virtualhosts"
            hide-actions
            item-key="name"
            class="mt--large"
        >
            <template v-slot:items="props">
                <td class="c-virtualhost text-xs-left title">
                    <a @click="$emit('openUrl', `http://${props.item.name}`)" title="Open in browser">
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
                            <v-list-tile v-for="(item, i) in actions" :key="i" @click="$emit('doAction', item.id, props.item)">
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </td>
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
    name: 'virtualhost-table',
    props: {
        virtualhosts: Array,
    },

    data: function () {
        return {
            headers: [
                { text: 'Virtualhost', value: 'name', class: 'title' },
                { text: 'Actions', value: 'actions', class: 'title', sortable: false, align: 'right' },
            ],
            actions: [
                { "id": "edit", "title": "edit" },
                //{ "id": "editm", "title": "edit manually" },
                { "id": "remove", "title": "remove" },
                { "id": "errorlog", "title": "open error.log" },
            ],
        }
    },
}
</script>
