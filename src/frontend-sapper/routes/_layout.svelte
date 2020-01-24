<script>
  import SimplePopup from '../components/simple-popup.svelte';
</script>

<svelte:head>
  <link rel="stylesheet" href="font-awesome/fontawesome.min.css">
	<link rel="stylesheet" href="font-awesome/solid.min.css">
	<link rel="stylesheet" href="font-awesome/brands.min.css">
	<!-- <link rel="stylesheet" href="https://unpkg.com/carbon-components@10.9.0/css/carbon-components.min.css" /> -->
	<link rel="stylesheet" href="css/quill.css" />
  <link rel="stylesheet" href="css/highlight.css" />
</svelte:head>

<style type="text/scss" global>
  @import "../styles/global.scss";
</style>

<main>
  <slot />
</main>
<SimplePopup />
