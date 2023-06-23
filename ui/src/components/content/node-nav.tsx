import { defineComponent, ref } from 'vue';
import BCMSIcon from '../icon';

const component = defineComponent({
  setup() {
    const position = ref('');

    window.editorNodeEnter = ({ element }) => {
      const bb = element.getBoundingClientRect();
      position.value = `top: ${bb.y}px; left: ${bb.left}px; width: ${bb.width}px;`;
    };

    window.editorNodeLeave = () => {
      position.value = '';
    };

    return () => {
      return position.value ? (
        <div
          class="flex flex-col absolute top-0 pl-2 pr-5 py-5 right-0 space-y-1 items-center translate-x-full -translate-y-10"
          style={position.value}
        >
          <button class="w-7 h-7 flex justify-center items-center text-grey hover:text-dark focus:text-dark">
            <BCMSIcon
              src="/plus"
              class="w-7 fill-current transition-colors duration-300"
            />
          </button>
          <button class="w-7 h-7 flex justify-center items-center text-grey hover:text-dark focus:text-dark">
            <BCMSIcon
              src="/arrow/up"
              class="w-5 fill-current transition-colors duration-300"
            />
          </button>
          <button class="w-7 h-7 flex justify-center items-center text-grey hover:text-dark focus:text-dark">
            <BCMSIcon
              src="/arrow/down"
              class="w-5 fill-current transition-colors duration-300"
            />
          </button>
          <button class="w-7 h-7 flex justify-center items-center text-grey hover:text-dark focus:text-dark">
            <BCMSIcon
              src="/trash"
              class="w-4.5 fill-current transition-colors duration-300"
            />
          </button>
        </div>
      ) : (
        ''
      );
    };
  },
});

export default component;
