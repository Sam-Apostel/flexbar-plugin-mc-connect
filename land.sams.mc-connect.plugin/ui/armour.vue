<template>
  <v-container>
    <!--  TODO: add instruction to how to install the mod  -->
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
};
</script>

<style scoped>

</style>