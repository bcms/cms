<script>
  import uuid from 'uuid';

  let data = {
    title: {
      value: '',
      quill: undefined,
    },
    slug: '',
    coverImageUri: '',
    desc: {
      value: '',
      quill: undefined,
    },
    content: [],
  };
</script>

<svelte:head>
  <script src="/js/quill.js">

  </script>
  <link rel="stylesheet" href="/css/quill.css" />
  <link rel="stylesheet" href="/css/entry-quill.css" />
</svelte:head>
