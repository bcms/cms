import { computed, defineComponent, ref } from 'vue';
import { BCMSIcon } from '..';
import { useTranslation } from '../../translations';
import Modal from './_modal';

const component = defineComponent({
  setup() {
    const translations = computed(() => {
      return useTranslation();
    });
    const show = ref(false);
    const activeViewIndex = ref(0);

    window.bcms.modal.showDescriptionExample = {
      hide() {
        show.value = false;
      },
      show() {
        show.value = true;
      },
    };

    // TODO: Add BCMS-related content describing use-cases and how to use description in general
    const views = [
      {
        button: {
          title:
            translations.value.modal.showDescriptionExampleTemplate.views[0]
              .title,
          desc: translations.value.modal.showDescriptionExampleTemplate.views[0]
            .description,
          icon: '/cog',
        },
        preview: {
          img: `${window.bcms.origin}/assets/components/modals/show-description-example/1.svg`,
          bgColor: '#249681',
        },
      },
      {
        button: {
          title:
            translations.value.modal.showDescriptionExampleTemplate.views[1]
              .title,
          desc: translations.value.modal.showDescriptionExampleTemplate.views[1]
            .description,
          icon: '/cog',
        },
        preview: {
          img: `${window.bcms.origin}/assets/components/modals/show-description-example/2.svg`,
          bgColor: '#f56b58',
        },
      },
      {
        button: {
          title:
            translations.value.modal.showDescriptionExampleTemplate.views[2]
              .title,
          desc: translations.value.modal.showDescriptionExampleTemplate.views[2]
            .description,
          icon: '/cog',
        },
        preview: {
          img: `${window.bcms.origin}/assets/components/modals/show-description-example/3.svg`,
          bgColor: '#ecada9',
        },
      },
    ];

    function cancel() {
      window.bcms.modal.showDescriptionExample.hide();
    }
    function done() {
      window.bcms.modal.showDescriptionExample.hide();
    }

    return () => (
      <Modal
        class="bcmsModal_showDescriptionExampleModal"
        onCancel={cancel}
        onDone={done}
        show={show.value}
        doNotShowFooter={true}
      >
        <div class="flex items-center">
          <div class="w-full p-8 flex flex-col md:w-[45%] md:p-0 md:pr-10">
            <div class="mb-6 text-2xl font-semibold leading-tight dark:text-light">
              {translations.value.modal.showDescriptionExampleTemplate.title}
            </div>
            {views.map((view, index) => {
              return (
                <button
                  class={`flex items-center py-3.5 px-4 rounded-sm transition-colors duration-300 mb-1 last:mb-0 hover:bg-grey hover:bg-opacity-20 focus:bg-grey focus:bg-opacity-20 text-dark dark:text-light ${
                    activeViewIndex.value === index
                      ? 'bg-grey bg-opacity-20'
                      : ''
                  }`}
                  key={index}
                  onClick={() => {
                    activeViewIndex.value = index;
                  }}
                >
                  <div class="mr-4.5">
                    <BCMSIcon
                      src={view.button.icon}
                      class="w-5 h-5 fill-current"
                    />
                  </div>
                  <div class="text-left text-current">
                    <p class="text-sm font-semibold">{view.button.title}</p>
                    <p class="text-xs">{view.button.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
          <div
            class="w-full p-8 md:p-11 md:pl-0 md:w-[55%] md:transition-colors md:duration-300 md:rounded-r-2.5"
            style={{
              backgroundColor: views[activeViewIndex.value].preview.bgColor,
            }}
          >
            <img
              src={views[activeViewIndex.value].preview.img}
              alt="Preview image"
              class="block object-cover w-full h-full"
            />
          </div>
        </div>
      </Modal>
    );
  },
});
export default component;
