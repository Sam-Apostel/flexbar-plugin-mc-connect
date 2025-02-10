<template>
    <v-container>
        <v-alert density="compact" icon="mdi-alert" outlined role="alert" :text="'Hello!'" type="info">
        </v-alert>
    </v-container>
</template>

<script>
export default {
    props: {
        modelValue: {
            type: Object,
            required: true,
        },
    },
    emits: ['update:modelValue'],
    data() {
        return {
        };
    },
    methods: {

    },
    mounted() {
    }
};
</script>

<style scoped></style>