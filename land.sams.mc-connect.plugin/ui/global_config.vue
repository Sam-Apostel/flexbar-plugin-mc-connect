<template>
    <v-container>
        <v-card prepend-icon="mdi-pencil" title="My Plugin Config">
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-text-field v-model="modelValue.config.test" label="Test" outlined hide-details></v-text-field>
                    </v-col>
                </v-row>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn variant="text" icon @click="saveConfig">
                    <v-icon>mdi-check-circle-outline</v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
export default {
    props: {
        /**
         * 
         * {
         *    "uuid": "<Your Plugin UUID>",
         *    "cid": "<Your Plugin UUID>.<Config Page Name>",
         *    "manifest": <Your Plugin Manifest>,
         *    "config": {}, // Config loadded from local file
         * }
         */
        modelValue: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
        };
    },
    methods: {
        saveConfig() {
            this.$fd.setConfig(this.modelValue.config)
            this.$fd.showSnackbarMessage("success", 'Config updated');
        }
    },
    mounted() {
    }
};
</script>

<style scoped></style>