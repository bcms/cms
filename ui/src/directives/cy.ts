import type { Directive } from 'vue';

export const cy: Directive<HTMLElement, string> = {
  beforeMount(el, bindings) {
    const useCy = localStorage.getItem('bcmsCy');
    if (useCy && bindings.value) {
      el.setAttribute('data-cy', bindings.value);
    }
  },
};
