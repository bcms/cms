<script context="module">
  export const ButtonType = {
    primary: 'primary',
    dangure: 'dangure',
    accept: 'accept',
  };
  export const ButtonSize = {
    small: {
      icon: '8',
      text: '10',
    },
    medium: {
      icon: '10',
      text: '14',
    },
    large: {
      icon: '12',
      text: '18',
    },
  };
</script>

<script>
  export let faClass = undefined;
  export let type = 'primary';
  export let backgroun = true;
  export let iconOnly = false;
  export let size = ButtonSize.small;
  export let click = () => {};

  let color;
  let bg;
  switch(ButtonType[type]) {
    case 'primary': {

    }break;
    default: {
      color: 'primary';
      
    }
  }
  if (!ButtonType[type]) {
    type = ButtonType.primary;
  }
  const buttonClass = 'button ' + type;
</script>

<style type="text/scss">
  @import './button.scss';
</style>

<button class={buttonClass} on:click={click}>
  <div class=""
  {#if faClass}
    <span class={`${faClass} icon`} style="font-size: {size.icon}pt;" />
    {#if iconOnly === false}&nbsp;{/if}
  {/if}
  {#if iconOnly === false}
    <span class="text" style="font-size: {size.text}pt;">
      <slot>
        <button />
      </slot>
    </span>
  {/if}
</button>
