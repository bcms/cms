<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import UrlQueries from '../../../url-queries.js';
  import StringUtil from '../../../string-util.js';
  import Base64 from '../../../base64.js';

  export let axios;
  export let Store;

  const queries = UrlQueries.get();
  let webhook;

  async function invoke() {
    if (confirm('Are you sure that you want to invoke this webhook?')) {
      const result = await axios.send({
        url: `/function/webhook`,
        method: 'POST',
        data: {
          webhook: {
            _id: webhook._id,
            name: webhook.name,
          },
          payload: webhook.body,
        },
      });
      if (result.success === false) {
        simplePopup.error(result.error.response.data.message);
        document.getElementById('response').innerHTML = JSON.stringify(
          result.error.response.data,
          null,
          '  ',
        );
        return;
      }
      document.getElementById('response').innerHTML = JSON.stringify(
        result.response.data,
        null,
        '  ',
      );
      simplePopup.success('Webhook invoked successfully.');
    }
  }

  onMount(async () => {
    const result = await axios.send({
      url: `/webhook/${queries.wid}`,
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    webhook = result.response.data.webhook;
  });
</script>

<style type="text/scss">
  @import './view.scss';
</style>

<Layout {Store} {axios}>
  {#if webhook}
    <div class="content">
      <div class="info">
        <div class="name">{StringUtil.prettyName(webhook.name)}</div>
        <div class="desc">
          {#if webhook.desc === ''}
            This Webhook does not have description.
          {:else}{webhook.desc}{/if}
        </div>
        <div class="body">
          {JSON.stringify(JSON.parse(Base64.decode(webhook.body)), null, '  ')}
        </div>
      </div>
      <div class="trigger">
        <button class="btn-fill btn-blue-bg invoke" on:click={invoke}>
          <div class="fas fa-tools icon" />
          <div class="text">Invoke</div>
        </button>
        <div class="body">
          <pre>
            <code id="response" />
          </pre>
        </div>
      </div>
    </div>
  {/if}
</Layout>
