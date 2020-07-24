<template>
  <label class="textInput">
    <span class="textInput--label">{{label}}</span>
    <span class='textInput--inner'>
      <input @keyup="onKeyDown" class="textInput--input" :placeholder="placeholder" v-model="textInputValue" :type='type'>
      <span class='textInput--actions'>
        <slot name="action" />
        <span class='textInput--tooltip' v-if="status.name === 'error'" v-tooltip.top-start="{content: status.message, classes: ['a', 'b']}">
          <icon-alert-triangle />
        </span>
      </span>
    </span>
  </label>
</template>

<script>
  export default {
    props: {
      value: {
        type: String,
        required: false,
        default() {
          return ''
        }
      },
      label: {
        type: String,
        required: true,
        default() {
          return ''
        }
      },
      type: {
        type: String,
        required: false,
        default() {
          return 'text'
        }
      },
      placeholder: {
        type: String,
        required: true,
        default() {
          return ''
        }
      },
      status: {
        type: Object,
        required: true,
        validator: (value) => {
          if (value && value.name === 'error') {
            if (!(value.message && value.message.length)) {
              return false
            }
          }
          return true;
        },
      }
    },
    data() {
      return {
        textInputValue: this.value
      }
    },
    methods: {
      onKeyDown() {
        this.$emit('input', this.textInputValue)
      }
    }
  }
</script>

<style lang="scss">
@import '@/assets/styles/components/global/form/_text-input.scss';
</style>