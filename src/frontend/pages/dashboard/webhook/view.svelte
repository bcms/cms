<script>
  import { onMount } from 'svelte';
  import { axios, webhookStore, pathStore } from '../../../config.svelte';
  import CodeSnippet from '../../../components/global/code-snippet.svelte';
  import { simplePopup } from '../../../components/simple-popup.svelte';
  import Layout from '../../../components/global/layout.svelte';
  import Button from '../../../components/global/button.svelte';
  import UrlQueries from '../../../url-queries.js';
  import StringUtil from '../../../string-util.js';
  import Base64 from '../../../base64.js';

  let queries = UrlQueries.get();
  let webhooks = [];
  let webhook;
  let serverResponse;
  let invokeDisabled = false;

  webhookStore.subscribe(value => {
    webhooks = value;
    webhook = value.find(e => e._id === queries.wid);
  });
  pathStore.subscribe(value => {
    setTimeout(() => {
      queries = UrlQueries.get();
      webhook = webhooks.find(e => e._id === queries.wid);
    }, 50);
  });

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
        serverResponse = JSON.stringify(result.error.response.data, null, '  ');
        return;
      }
      serverResponse = JSON.stringify(result.response.data, null, '  ');
      simplePopup.success('Webhook invoked successfully.');
      invokeDisabled = true;
    }
  }
</script>

<style type="text/scss">
  .content {
    padding: 20px;
  }

  .sections {
    display: grid;
    grid-template-columns: auto auto;
    grid-gap: 20px;
  }
</style>

<Layout>
  {#if webhook}
    <div class="content">
      <div class="info">
        <h3>{StringUtil.prettyName(webhook.name)}</h3>
        <div class="desc">
          {#if webhook.desc === ''}
            This Webhook does not have description.
          {:else}{webhook.desc}{/if}
        </div>
      </div>
      <div class="sections mt-50">
        <div class="section">
          <Button
            icon="fas fa-tools"
            disabled={invokeDisabled}
            on:click={() => {
              invoke();
              invokeDisabled = true;
              const coolDownTimer = setTimeout(() => {
                invokeDisabled = false;
                clearTimeout(coolDownTimer);
              }, 5000);
            }}>
            Invoke
          </Button>
        </div>
        <div class="section" />
        <div class="section">
          <div class="--legend">Webhook payload</div>
          <CodeSnippet
            type="multi"
            code={JSON.stringify(JSON.parse(Base64.decode(webhook.body)), null, '  ')} />
        </div>
        <div class="section">
          <div class="--legend">Server response</div>
          <CodeSnippet
            type="multi"
            code={serverResponse ? serverResponse : 'Not available...'} />
        </div>
      </div>
    </div>
  {/if}
</Layout>
