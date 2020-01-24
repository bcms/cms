<script>
  import { Router, Route } from 'svelte-routing';
  import { onMount } from 'svelte';

  import SimplePopup from './components/simple-popup.svelte';
  import Login from './pages/login.svelte';
  import Page404 from './pages/404.svelte';

  import Store from './store.js';
  import AxiosClient from './axios-client.js';

  import Overview from './pages/dashboard/overview.svelte';
  import TemplateEditor from './pages/dashboard/template/editor.svelte';
  import GroupEditor from './pages/dashboard/group/editor.svelte';
  import WidgetEditor from './pages/dashboard/widget/editor.svelte';
  import EntriesView from './pages/dashboard/entry/view.svelte';
  import EntryEditor from './pages/dashboard/entry/editor.svelte';
  import UsersEditor from './pages/dashboard/users/editor.svelte';
  import ApiEditor from './pages/dashboard/api/editor.svelte';
  import WebhookEditor from './pages/dashboard/webhook/editor.svelte';
  import WebhookView from './pages/dashboard/webhook/view.svelte';
  import MediaOverview from './pages/dashboard/media/overview.svelte';
  import LanguageEditor from './pages/dashboard/language/editor.svelte';

  let axios = AxiosClient.instance();
  axios.config({
    baseURL: '',
    preRequestFunction: AxiosClient.jwtAutoRefreshPreRequestFunction(
      Store,
      '/auth/token/refresh',
      '/login',
    ),
  });

  if (window.location.pathname === '/') {
    window.location = '/login';
  }

  export let url = '';
</script>

<style type="text/scss" global>
  @import './styles/global.scss';
</style>

<svelt:head>
  <link rel="stylesheet" href="/font-awesome/fontawesome.min.css" />
  <link rel="stylesheet" href="/font-awesome/solid.min.css" />
  <link rel="stylesheet" href="/font-awesome/brands.min.css" />
  <link rel="stylesheet" href="/css/quill.css" />
  <link rel="stylesheet" href="/css/highlight.css" />
</svelt:head>

<Router {url}>
  {#if window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/login')}
    <div class="container">
      <Route path="/login">
        <Login {Store} {axios} />
      </Route>
      {#if window.location.pathname.startsWith('/dashboard')}
        <Route path="/dashboard/overview">
          <Overview {Store} {axios} />
        </Route>
        <Route path="/dashboard/template/editor">
          <TemplateEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/group/editor">
          <GroupEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/widget/editor">
          <WidgetEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/template/entries/view/c/:cid">
          <EntriesView {Store} {axios} />
        </Route>
        <Route path="/dashboard/template/entry/rc">
          <EntryEditor {Store} {axios} />
        </Route>

        <Route path="/dashboard/media/editor">
          <MediaOverview {Store} {axios} />
        </Route>

        <Route path="/dashboard/user/editor">
          <UsersEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/api/editor">
          <ApiEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/webhook/editor">
          <WebhookEditor {Store} {axios} />
        </Route>
        <Route path="/dashboard/webhook/trigger/view/w/:wid">
          <WebhookView {Store} {axios} />
        </Route>

        <Route path="/dashboard/language/editor">
          <LanguageEditor {Store} {axios} />
        </Route>
      {/if}
    </div>
  {:else}
    <Page404 />
  {/if}
</Router>
<SimplePopup />
