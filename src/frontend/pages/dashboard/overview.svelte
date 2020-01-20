<script>
  import Layout from '../../components/layout/layout.svelte';
  import { Button, Icon } from 'carbon-components-svelte';

  export let axios;
  export let Store;
</script>

<Layout {Store} {axios}>
  <Button kind={'primary'} size={'small'} iconDescription={"Test"}>
    <Icon className={'fas fa-plus'} render={Button}/>
    <span>Test</span>
  </Button>
</Layout>
