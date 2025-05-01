<template>
  <v-container>
    <v-text-field v-model="modelValue.data.slot" :label="$t('Inventory.UI.Slot')" type="number" hide-details
                  outlined class="mx-2"></v-text-field>

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
};
</script>

<style scoped></style>