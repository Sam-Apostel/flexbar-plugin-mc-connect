<template>
  <v-container>
    <v-row class="align-center">
        <v-col cols="12" class="pb-4">
            <v-text-field v-model="modelValue.data.path" variant="underlined" :maxlength="8192"
                label="Path" clearable rows="4" >
                <template v-slot:append-inner>
                    <div class="d-flex align-center justify-end">
                        <v-btn density="compact" variant="plain" icon @click="triggerSelectFolder">
                            <v-icon>mdi-folder-open</v-icon>
                        </v-btn>
                    </div>
                </template>
            </v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="onTest">TEST</v-btn>
        </v-col>
    </v-row>
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
  methods: {
    async triggerSelectFolder() {
        const result = await this.$com.sendToBackend({
          data: 'Hello from UI',
        })
        console.log('Received response from plugin:', result);
        this.modelValue.data.path = result
    },
    async onTest() {
      const result = await this.$com.sendToBackend({ data: 'Hello' });
      console.log('Received response from plugin:', result);
    }
  },
  mounted() {
    this.$utils.test()
    console.log(this.$com)

    this.$com.onBackendMessage((data) => {
        console.log('Received message from plugin:', data);
    });
  },
};
</script>
