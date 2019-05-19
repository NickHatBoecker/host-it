<template>
    <button type="button" class="v-btn theme--dark v-btn--small blue jbtn-file">
        <div class="v-btn__content">
            {{ title }}
            <input type="file" webkitdirectory v-on:change="fileSelected">
        </div>
    </button>
</template>

<script>
export default {
    name: 'select-file-button',
    props: {
        selectedCallback: Function,
        title: String
    },
    methods: {
        fileSelected(e) {
            if (this.selectedCallback) {
                if (e.target.files[0]) {
                    this.selectedCallback(e.target.files[0]);
                } else {
                    this.selectedCallback(null);
                }
            }
        }
    }
}
</script>

<style scoped>
.jbtn-file {
    cursor: pointer;
    position: relative;
    overflow: hidden;
    margin: -12px 0 24px -1px;
}

.jbtn-file input[type=file] {
    position: absolute;
    top: 0;
    right: 0;
    min-width: 100%;
    min-height: 100%;
    text-align: right;
    filter: alpha(opacity=0);
    opacity: 0;
    outline: none;
    cursor: inherit;
    display: block;
}
</style>
