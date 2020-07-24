<template>
  <div>
    <div class="row">
      <validation-provider rules="required" v-slot="{ errors }">
        <text-input
          label="Your name"
          state="error"
          placeholder="Please enter your name"
          v-model="yourName"
          :status="{
            name: errors[0] ? 'error' : '',
            message: errors[0]
          }"
        />
      </validation-provider>
    </div>
    <div class="row">
      <text-input
        label="Your password"
        state="error"
        placeholder="Please enter your password"
        type="password"
        :status="{}"
      >
        <template v-slot:action>
          <button class="textInput--actions-btn">Forgot password?</button>
        </template>
      </text-input>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      yourName: 'lalala',
    };
  },
};
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  margin: 40px 0;
}
</style>