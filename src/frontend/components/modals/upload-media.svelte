<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../simple-popup.svelte';
  import Modal from '../modal.svelte';
  import MultiAdd from '../multi-add.svelte';
  import OnOff from '../on-off.svelte';
  import StringUtil from '../../string-util.js';

  export let axios;
  export let events;

  const modalHeading = {
    icon: '/assets/ics/template/icon_type_ct.png',
    title: `Upload File`,
  };
  let medias = [];
  let media;

  events.cancel = () => {
    events.toggle();
  };
  events.done = () => {
    events.toggle();
    events.callback(media);
  };

  onMount(async () => {
    const result = await axios.send({
      url: '/media/all',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    medias = result.response.data.media;
  });
</script>

<style>

</style>

<Modal heading={modalHeading} {events} />
