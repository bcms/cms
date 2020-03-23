<script>
  import { Router, Route } from 'svelte-routing';
  import { onMount } from 'svelte';
  import { Store, pathStore } from './config.svelte';

  import SimplePopup from './components/simple-popup.svelte';
  import Login from './pages/login.svelte';
  import CreateAdmin from './pages/create-admin.svelte';
  import Page404 from './pages/404.svelte';
  import FontAwesome from './components/global/font-awesome.svelte';

  import Overview from './pages/dashboard/overview.svelte';
  import AdminInit from './pages/admin.svelte';
  import TemplateEditor from './pages/dashboard/template/editor.svelte';
  import GroupEditor from './pages/dashboard/group/editor.svelte';
  import WidgetEditor from './pages/dashboard/widget/editor.svelte';
  import EntriesView from './pages/dashboard/entry/view.svelte';
  import EntryEditor from './pages/dashboard/entry/editor.svelte';
  import UsersEditor from './pages/dashboard/users/editor.svelte';
  import ApiEditor from './pages/dashboard/api/editor.svelte';
  import WebhookEditor from './pages/dashboard/webhook/editor.svelte';
  import WebhookView from './pages/dashboard/webhook/view.svelte';
  import MediaEditor from './pages/dashboard/media/overview.svelte';
  import LanguageEditor from './pages/dashboard/language/editor.svelte';

  export let url = '';

  let routes = [
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/create-admin',
      component: CreateAdmin,
    },
    {
      path: '/admin',
      component: AdminInit,
    },
    {
      path: '/dashboard/overview',
      component: Overview,
    },
    {
      path: '/dashboard/template/editor',
      component: TemplateEditor,
    },
    {
      path: '/dashboard/group/editor',
      component: GroupEditor,
    },
    {
      path: '/dashboard/widget/editor',
      component: WidgetEditor,
    },
    {
      path: '/dashboard/template/entries/view/c/:cid',
      component: EntriesView,
    },
    {
      path: '/dashboard/template/entry/rc',
      component: EntryEditor,
    },
    {
      path: '/dashboard/media/editor',
      component: MediaEditor,
    },
    {
      path: '/dashboard/user/editor',
      component: UsersEditor,
    },
    {
      path: '/dashboard/api/editor',
      component: ApiEditor,
    },
    {
      path: '/dashboard/webhook/editor',
      component: WebhookEditor,
    },
    {
      path: '/dashboard/webhook/trigger/view/w/:wid',
      component: WebhookView,
    },
    {
      path: '/dashboard/language/editor',
      component: LanguageEditor,
    },
    {
      path: '/',
      component: Login,
    },
  ];

  function validatePath(path) {
    const pathParts = path.split('/');
    let found = false;
    for (const i in routes) {
      const routeParts = routes[i].path.split('/');
      if (pathParts.length === routeParts.length) {
        let isOk = true;
        for (const j in routeParts) {
          const routePart = routeParts[j];
          const pathPart = pathParts[j];
          if (routePart.startsWith(':') === false) {
            if (routePart !== pathPart) {
              isOk = false;
              break;
            }
          }
        }
        if (isOk === true) {
          found = true;
          break;
        }
      }
    }
    return found;
  }
</script>

<style type="text/scss" global>
  @import './styles/global.scss';
</style>

<Router {url}>
  {#if Store && Store.get('loggedIn') && Store.get('loggedIn') === true}
    <FontAwesome />
  {/if}
  {#each routes as route}
    <Route path={route.path} component={route.component} />
  {/each}
  {#if validatePath(window.location.pathname) === false}
    <Page404 />
  {/if}
</Router>
<SimplePopup />
