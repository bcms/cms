import { defineComponent, onUnmounted, type PropType, ref } from 'vue';
import type { BCMSNavItemMergeEvent, BCMSNavItemType } from '../../../types';
import BCMSLink from '../../link';
import BCMSIcon from '../../icon';

const component = defineComponent({
  props: {
    item: { type: Object as PropType<BCMSNavItemType>, required: true },
    cyTag: String,
    draggable: Boolean,
    isNested: Boolean,
  },
  emits: {
    merge: (_: BCMSNavItemMergeEvent) => {
      return true;
    },
  },
  setup(props, ctx) {
    const isExtended = ref(props.item.selected);
    let itemClicked = false;
    const isDragging = ref(false);
    let ghostEle: HTMLElement;

    function handleDragging(event: MouseEvent) {
      if (props.draggable) {
        // event.preventDefault();
        itemClicked = true;
        document.addEventListener('mouseup', handleDrop);
        document.addEventListener('mousemove', handleMouseMove);

        const currentTarget = event.currentTarget as HTMLElement;
        if (currentTarget) {
          currentTarget.classList.add('nav-dragging');
          currentTarget
            .querySelector('span')
            ?.classList.add('text-green', 'dark:text-yellow');
        }
      }
    }
    function handleMouseMove(event: MouseEvent) {
      event.preventDefault();

      if (ghostEle) {
        ghostEle.style.left = `${event.clientX}px`;
        ghostEle.style.top = `${event.clientY}px`;
      }

      if (itemClicked) {
        isDragging.value = true;
      }
    }
    function handleDrop(event: MouseEvent) {
      event.preventDefault();

      if (ghostEle) {
        document.body.removeChild(ghostEle);
      }

      if (itemClicked && isDragging) {
        // check if we are not dropping item onto itself
        const dropTargetId = findFirstParent(event.target as HTMLElement);
        const dropTargetElement = document.querySelector(
          `[data-drag-id="${dropTargetId}"]`,
        );
        if (
          dropTargetElement &&
          dropTargetElement.classList.contains('nav-dragging')
        ) {
          const currentNavDragging = document.querySelector('.nav-dragging');
          if (currentNavDragging) {
            currentNavDragging.classList.remove('nav-dragging');
            currentNavDragging
              .querySelector('span')
              ?.classList.remove('text-green', 'dark:text-yellow');
          }
          document.removeEventListener('mouseup', handleDrop);
          document.removeEventListener('mousemove', handleMouseMove);
          return false;
        }
        ctx.emit('merge', {
          src: props.item,
          targetId: findFirstParent(event.target as HTMLElement),
        });
      }
      itemClicked = false;
      isDragging.value = false;

      const currentNavDragging = document.querySelector('.nav-dragging');
      if (currentNavDragging) {
        currentNavDragging.classList.remove('nav-dragging');
        currentNavDragging
          .querySelector('span')
          ?.classList.remove('text-green', 'dark:text-yellow');
      }
      document.removeEventListener('mouseup', handleDrop);
      document.removeEventListener('mousemove', handleMouseMove);
    }
    function findFirstParent(target: HTMLElement | undefined): string {
      if (!target) {
        return 'root';
      }
      let dragId = target.getAttribute('data-drag-id');
      if (dragId) {
        return dragId;
      }
      const parent = target.parentElement as HTMLElement | undefined;
      if (!parent) {
        return 'root';
      }
      dragId = target.getAttribute('data-drag-id');
      return dragId ? dragId : findFirstParent(parent);
    }
    function handleGroupMouseEnter(event: MouseEvent) {
      const target = event.currentTarget as HTMLElement;
      const draggingElement = document.querySelector(
        '.nav-dragging',
      ) as HTMLElement;

      if (draggingElement && target.getAttribute('data-nested') === 'true') {
        isExtended.value = true;
        target.classList.remove('after:opacity-0');
        target.classList.add('after:opacity-100');
      }
    }

    function handleChildMouseEnter(event: MouseEvent) {
      const target = event.currentTarget as HTMLElement;
      const draggingElement = document.querySelector(
        '.nav-dragging',
      ) as HTMLElement;
      const isInsideNest = !!target.closest('[data-nested="true"');

      if (
        !isInsideNest &&
        draggingElement &&
        target.getAttribute('data-drag-id') !==
          draggingElement.getAttribute('data-drag-id') &&
        target.getAttribute('data-nested') !== 'true'
      ) {
        target.classList.remove('after:opacity-0');
        target.classList.add('after:opacity-100');
      }
    }

    function handleItemMouseLeave(event: MouseEvent) {
      const target = event.currentTarget as HTMLElement;

      target.classList.remove('after:opacity-100');
      target.classList.add('after:opacity-0');
    }

    function handleGhostStart(event: DragEvent) {
      event.preventDefault();

      const target = event.currentTarget as HTMLElement;

      ghostEle = document.createElement('div');
      ghostEle.classList.add(
        'fixed',
        'z-1000000',
        '-translate-x-1/2',
        '-translate-y-1/2',
        'text-sm',
        'px-4',
        'pt-[5px]',
        'pb-1',
        'font-semibold',
        'bg-[rgba(220,220,220,0.8)]',
        'rounded',
        'pointer-events-none',
        'dark:bg-darkGrey/80',
        'dark:text-white',
      );
      ghostEle.innerHTML = target.getAttribute('data-label') || '';

      document.body.appendChild(ghostEle);

      event.dataTransfer?.setDragImage(ghostEle, 0, 0);
    }

    onUnmounted(() => {
      document.removeEventListener('mouseup', handleDrop);
      document.removeEventListener('mousemove', handleMouseMove);
    });

    return () => (
      <>
        {props.item.type === 'parent' ? (
          <li
            data-drag-id={props.item.id ? props.item.id : ''}
            data-nested={props.isNested}
            data-nav-draggable={props.draggable}
            v-cy={props.cyTag}
            class={`relative mb-[15px] list-none after:transition-opacity after:duration-300 after:absolute after:top-1/2 after:left-1/2 after:translate-x-[calc(-50%-10px)] after:-translate-y-1/2 after:w-[calc(100%+40px)] after:h-[calc(100%+20px)] after:opacity-0 after:rounded after:pointer-events-none after:bg-darkGrey/10 desktop:mb-[25px] dark:after:bg-darkGrey/30 ${
              props.isNested ? 'hover:after:opacity-100' : ''
            }`}
            onMouseenter={handleGroupMouseEnter}
            onMouseleave={handleItemMouseLeave}
          >
            <button
              data-is-extending={isExtended.value}
              class={`relative z-10 text-xs leading-normal tracking-0.06 uppercase w-[calc(100%+15px)] text-left flex items-center translate-x-[-15px] ${
                props.isNested ? 'mt-9 mb-2' : 'mb-[25px]'
              } dark:text-light`}
              onClick={() => {
                isExtended.value = !isExtended.value;
              }}
            >
              <span class={`flex mr-3 ${isExtended.value ? 'rotate-90' : ''}`}>
                <BCMSIcon
                  src="/caret/right"
                  class="w-1 h-2 text-dark fill-current dark:text-light"
                />
              </span>
              <span class="pointer-events-none mt-1">{props.item.name}</span>
            </button>
            <ul
              data-drag-id={props.item.id ? props.item.id : ''}
              class={`relative z-10 list-none pl-2 ${
                isExtended.value ? 'block mt-5 -mb-3' : 'hidden'
              }`}
            >
              {props.item.children &&
                props.item.children.map((child) => (
                  <component
                    item={child}
                    cyTag={`${props.cyTag}-${child.name}`}
                    isNested={true}
                    draggable={props.draggable}
                    onMerge={(event: BCMSNavItemMergeEvent) => {
                      ctx.emit('merge', event);
                    }}
                  />
                ))}
            </ul>
          </li>
        ) : (
          <>
            {props.item.visible && (
              <li
                data-drag-id={props.item.id ? props.item.id : ''}
                v-cy={props.cyTag}
                class={`relative ${
                  props.item.selected
                    ? 'last:mb-0 desktop:before:absolute desktop:before:w-[5px] desktop:before:h-[5px] desktop:before:rounded-full desktop:before:bg-green desktop:before:top-1/2 desktop:before:left-[-15px] desktop:before:-translate-y-1/2 desktop:dark:before:bg-yellow'
                    : ''
                } ${
                  props.draggable
                    ? 'after:transition-opacity after:duration-300 after:absolute after:top-1/2 after:left-1/2 after:translate-x-[calc(-50%-10px)] after:-translate-y-1/2 after:w-[calc(100%+40px)] after:h-[calc(100%+0px)] after:opacity-0 after:rounded-sm after:pointer-events-none after:bg-darkGrey/10 dark:after:bg-darkGrey/30'
                    : ''
                }`}
                data-label={props.item.name}
                onMousedown={handleDragging}
                onMouseenter={handleChildMouseEnter}
                onMouseleave={handleItemMouseLeave}
                onDragstart={handleGhostStart}
              >
                {typeof props.item.onClick === 'string' ? (
                  <BCMSLink
                    href={props.item.onClick}
                    disabled={
                      props.item.ignoreSelected ? false : props.item.selected
                    }
                    class="relative z-10 group flex items-center justify-between no-underline py-2.5 mb-1.5 text-dark dark:text-light"
                  >
                    <span
                      class={`text-base leading-tight -tracking-0.01 relative after:block after:w-full after:h-px after:absolute after:top-full after:left-0 after:bg-dark after:bg-opacity-0 after:-translate-y-0.5 after:transition-all after:duration-500 after:rounded-sm group-hover:after:bg-opacity-100 group-hover:after:translate-x-0 group-hover:after:translate-y-0 group-focus-visible:after:bg-opacity-100 group-focus-visible::after:translate-x-0 group-focus-visible::after:translate-y-0 ${
                        props.item.selected ? 'font-semibold' : ''
                      } dark:after:bg-yellow dark:after:bg-opacity-0`}
                    >
                      {props.item.name}
                    </span>
                    <span
                      class={`flex items-center ${
                        props.item.selected
                          ? 'text-green dark:text-yellow'
                          : 'text-dark dark:text-light'
                      }`}
                    >
                      {props.item.icon && (
                        <BCMSIcon
                          src={props.item.icon}
                          class="fill-current transition-all duration-300 w-5 h-5 group-hover:text-green group-focus-visible:text-green desktop:w-6 desktop:h-6 dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
                        />
                      )}
                    </span>
                  </BCMSLink>
                ) : (
                  <BCMSLink
                    href={props.item.href || ''}
                    disabled
                    clickOverride={true}
                    onClick={props.item.onClick}
                    class="relative z-10 group flex items-center justify-between no-underline py-2.5 mb-1.5 text-dark dark:text-light"
                  >
                    <span
                      class={`text-base leading-tight -tracking-0.01 relative transition-all duration-300 after:block after:w-full after:h-px after:absolute after:top-full after:left-0 after:bg-dark after:bg-opacity-0 after:-translate-y-0.5 after:transition-all after:duration-500 after:rounded-sm group-hover:after:bg-opacity-100 group-hover:after:translate-x-0 group-hover:after:translate-y-0 group-focus-visible:after:bg-opacity-100 group-focus-visible::after:translate-x-0 group-focus-visible::after:translate-y-0 ${
                        props.item.selected ? 'font-semibold' : ''
                      } dark:after:bg-yellow dark:after:bg-opacity-0`}
                    >
                      {props.item.name}
                    </span>
                    <span
                      class={`flex items-center ${
                        props.item.selected
                          ? 'text-green dark:text-yellow'
                          : 'text-dark dark:text-light'
                      }`}
                    >
                      {props.item.icon && (
                        <BCMSIcon
                          src={props.item.icon}
                          class="fill-current transition-all duration-300 w-5 h-5 group-hover:text-green group-focus-visible:text-green desktop:w-6 desktop:h-6 dark:group-hover:text-yellow dark:group-focus-visible:text-yellow"
                        />
                      )}
                    </span>
                  </BCMSLink>
                )}
              </li>
            )}
          </>
        )}
      </>
    );
  },
});

export default component;
