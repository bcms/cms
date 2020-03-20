<script>
  import { afterUpdate, createEventDispatcher } from 'svelte';
  import Menu from '../menu.svelte';
  import Button from '../global/button.svelte';
  import PropsList from '../prop/props-list.svelte';
  import StringUtil from '../../string-util.js';

  export let items;
  export let itemSelected;
  export let onlySlot = false;
  /**
   * @param {string} heading
   * @param {string} buttonLabel
   */
  export let menuConfig;

  const dispatch = createEventDispatcher();
  let props = [];

  afterUpdate(() => {
    if (itemSelected) {
      if (itemSelected.entryTemplate) {
        props = itemSelected.entryTemplate;
      } else if (!itemSelected.username) {
        props = itemSelected.props;
      }
    }
  });
</script>

<style type="text/scss">
  @import './manager-content.scss';
</style>

<div class="manager">
  <Menu
    events={{ clicked: item => {
        dispatch('itemClicked', item);
      }, addNewItem: () => {
        dispatch('addNewItem', 'none');
      } }}
    config={{ heading: menuConfig.heading, buttonLabel: menuConfig.buttonLabel, items, itemSelected }} />
  <div class="content-wrapper">
    <div class="content">
      {#if itemSelected}
        <div class="heading">
          {#if itemSelected.username}
            <h3>
              {StringUtil.prettyName(itemSelected.username.replace(/ /g, '_'))}
            </h3>
          {:else}
            <h3>{StringUtil.prettyName(itemSelected.name)}</h3>
            <div class="edit">
              <Button
                icon={'fas fa-edit'}
                onlyIcon={true}
                kind={'ghost'}
                size={'small'}
                on:click={() => {
                  dispatch('edit', 'none');
                }} />
            </div>
          {/if}
        </div>
        {#if itemSelected.name}
          <div class="desc">
            {#if itemSelected.desc === ''}
              Description is not available for this item.
            {:else}{itemSelected.desc}{/if}
          </div>
        {/if}
        <div class="basic-info">
          <div>
            <div class="bx--label">ID</div>
            <div class="bx--form__helper-text">{itemSelected._id}</div>
          </div>
          <div>
            <div class="bx--label">Created At</div>
            <div class="bx--form__helper-text">
              {new Date(itemSelected.createdAt).toLocaleString()}
            </div>
          </div>
          <div>
            <div class="bx--label">Updated At</div>
            <div class="bx--form__helper-text">
              {new Date(itemSelected.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
        {#if onlySlot === true}
          <div class="props">
            <slot />
          </div>
        {:else}
          <div class="props">
            {#if props.length > 0}
              <div class="heading">
                <div class="prop-count">
                  {props.length} properties in this Template
                </div>
                <div class="action">
                  <Button
                    icon={'fas fa-plus'}
                    size={'small'}
                    on:click={() => {
                      dispatch('addProp', 'none');
                    }}>
                    Add Property
                  </Button>
                </div>
              </div>
              <div class="values">
                <slot />
              </div>
              <div class="action">
                <Button
                  icon={'fas fa-plus'}
                  size={'small'}
                  on:click={() => {
                    dispatch('addProp', 'none');
                  }}>
                  Add Property
                </Button>
              </div>
            {:else}
              <div class="no-props">
                <div class="message">There are no properties yet</div>
                <div class="desc">Add your first to this Template</div>
                <div class="action">
                  <Button
                    icon={'fas fa-plus'}
                    size={'small'}
                    on:click={() => {
                      dispatch('addProp', 'none');
                    }}>
                    Add Property
                  </Button>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        <div class="delete">
          <Button
            icon={'fas fa-trash'}
            size={'small'}
            kind={'danger'}
            on:click={() => {
              dispatch('delete', itemSelected);
            }}>
            Delete
          </Button>
        </div>
      {:else}
        <div class="props">
          <div class="no-props">
            <div class="message">
              No {StringUtil.prettyName(menuConfig.heading)} in Database yet
            </div>
            <div class="desc">Add your first now</div>
            <div class="action">
              <Button
                icon="fas fa-plus"
                size={'small'}
                on:click={() => {
                  dispatch('addNewItem', 'none');
                }}>
                {menuConfig.buttonLabel}
              </Button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
