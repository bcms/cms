import { defineComponent, ref } from 'vue';

const component = defineComponent({
  setup() {
    const tooltip = window.bcms.tooltip;
    const show = ref(false);
    const kind = ref<'default' | 'info'>('default');
    const position = ref({
      top: 0,
      left: 0,
      width: 300,
    });
    const message = ref('');

    function screenOverflow(
      screenWidth: number,
      screenPosition: number,
      elementWidth: number
    ) {
      const delta = screenPosition + elementWidth - screenWidth;
      return delta < 0 ? 0 : delta;
    }
    function calcPosition(target: HTMLElement) {
      // TODO: Fix position calculations
      if (target) {
        const targetBounding = target.getBoundingClientRect();
        position.value.top = targetBounding.top + 22;
        position.value.left =
          targetBounding.left -
          screenOverflow(window.innerWidth, targetBounding.left, 300);
      }
    }

    tooltip.show = (target, msg, type) => {
      message.value = msg;
      calcPosition(target);
      show.value = true;
      kind.value = type;
      if (type === 'info' && window.innerWidth > 768) {
        position.value.width = 420;
      }
    };

    tooltip.hide = () => {
      show.value = false;
    };

    return () => (
      <div
        class="fixed z-[1000000]"
        style={`display: ${show.value ? 'block' : 'none'};
        top: ${position.value.top}px;
        left: ${position.value.left}px;
        max-width: ${position.value.width}px;`}
      >
        <div
          class={`text-sm -tracking-0.01 leading-tight ${
            kind.value === 'default'
              ? 'bg-dark text-white rounded-3xl py-[5px] px-[15px] desktop:text-base'
              : 'bg-light text-grey border-2 border-green rounded-2.5 py-[15px] px-4.5'
          } dark:bg-darkGrey`}
        >
          {message.value}
        </div>
      </div>
    );
  },
});

export default component;
