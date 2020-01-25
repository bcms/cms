<script>
  import { createEventDispatcher } from 'svelte';
  import { Link } from 'svelte-routing';
  import Button from '../global/button.svelte';
  import StringUtil from '../../string-util.js';

  export let groups;
  export let props;

  const dispatch = createEventDispatcher();
</script>

<table class="table w-100p">
  <tr class="table-header">
    <th>
      <p>Required</p>
    </th>
    <th>
      <p>Name</p>
    </th>
    <th>
      <p>Type</p>
    </th>
    <th class="w-100">
      <p>Edit</p>
    </th>
    <th class="w-50">
      <p>Remove</p>
    </th>
  </tr>
  {#each props as prop, i}
    <tr class="table-row">
      <td>
        <span class="fas fa-{prop.required === true ? 'lock' : 'unlock'}" />
      </td>
      <td>
        <p>{StringUtil.prettyName(prop.name)}</p>
      </td>
      <td>
        <p>
          {StringUtil.prettyName(prop.type)}
          {#if prop.type === 'GROUP_POINTER' || prop.type === 'GROUP_POINTER_ARRAY'}
            &nbsp;
            <span class="fas fa-arrow-alt" />
            &nbsp;
            <Link to="/dashboard/group/editor?gid={prop.value._id}">
              <span class="fas fa-link" />
              &nbsp; {StringUtil.prettyName(groups.find(e => e._id === prop.value._id).name)}
            </Link>
          {/if}
        </p>
      </td>
      <td>
        <Button
          class="w-100p"
          kind="secondary"
          size="small"
          on:click={() => {
            dispatch('edit', { prop, i });
          }}>
          Edit
        </Button>
      </td>
      <td>
        <Button
          class="w-100p"
          kind="danger"
          size="small"
          on:click={() => {
            dispatch('remove', { prop, i });
          }}>
          Remove
        </Button>
      </td>
    </tr>
  {/each}
</table>
