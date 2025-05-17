<template>
  <v-container>
    <!--  TODO: add instruction to how to install the mod  -->
    <div class="inventory">
      <button
          @click="selectSlot(40)"
          class="mc-slot mr-4"
          :class="{ selectedSlot: getIsSelected(40) }"
      >
        F
      </button>
      <div v-for="(n, slot) in 9" :key="slot" class="hotbar">

        <button
            @click="selectSlot(slot)"
            class="mc-slot"
            :class="{ selectedSlot: getIsSelected(slot) }"
        >
          {{ slot + 1 }}
        </button>
      </div>
    </div>
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
  computed: {
    selectedSlot() {
      return this.modelValue.data.slot;
    },
  },
  methods: {
    selectSlot(slot) {
      const newValue = {...this.modelValue, data: {...this.modelValue.data, slot}};
      this.$emit('update:modelValue', newValue);
    },
    getIsSelected(slot) {
      return this.selectedSlot === slot;
    },
    doCommand(e) {
      const key = String.fromCharCode(e.keyCode);
      if (['1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(key)) {
        this.selectSlot(key - 1)
      }
      if (key === 'F') {
        this.selectSlot(40)
      }
    }
  },
  created() {
    window.addEventListener('keydown', this.doCommand);
  },
  destroyed() {
    window.removeEventListener('keydown', this.doCommand);
  },

};
</script>

<style scoped>
.inventory {
  display: inline-flex;

  background-color: #3c3c3c;
  padding: 4px;
  overflow-x: scroll;
  scrollbar-width: none;
}

.mc-slot {
  background-color: #8b8b8b;
  box-shadow: inset 0 0 4px #000000aa;
  font-family: 'Minecraft', monospace;
  color: white;
  width: 40px;
  height: 40px;
  z-index: 0;
  flex-shrink: 0;
  flex-basis: 40px;
  flex-grow: 0;
}

.hotbar {
  display: flex;
  gap: 2px;
  background-color: #3c3c3c;
}
.selectedSlot {
  outline: 2px solid #fff;
  outline-offset: 2px;
  z-index: 1;
}
</style>