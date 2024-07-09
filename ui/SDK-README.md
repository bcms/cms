# BCMS SDK

BCMS SDK is used to abstract REST API calls and caching for the client-side
applications. Without this module, UI developers would have to implement REST
API calls for the Backend module and take care of caching and storing data. This
is not an easy task; therefore, this module is developed to allow UI developers
to focus on the interface and user experience without worrying about request
payload size, streams, and sockets.

With this in mind, the BCMS SDK is an abstraction layer between UI and Backend
of the BCMS. Some of the things that this module covers are:

- Cache layer - caching is done in memory, which means that data is available
  only during the same session. If a browser tab is reloaded, the cache is lost.
- Authentication - there is no need to worry about security tokens and
  lifecycles.
- Communication with Backend API - there is no need to make manual HTTP
  requests; just use abstract methods to get data, for example,
  `sdk.template.getAll()` to get all available templates.
- Sockets - data synchronization is also handled, and the cache will always be
  in sync with other sessions.
- The cache can be connected with a Vue store and reactive variables which allow
  use of computed functions.

This module is written in such a way that it can be used in browser and on the
server.

## Getting started

```ts
const sdk = createSdk(
    Store, // Store used to cache data (in-memory)
    Storage, // Storage used for saving data (persistant)
    {
        metadata() {
            return {};
        },
    }
);
if (!(await sdk.isLoggedIn())) {
    // Redirect user to OAuth callback, for example, Google
    window.location.href = 'https://app.thebcms.com/api/v3/auth/oauth/redirect/google'
    return;
}
// Get all templates
const templates = await sdk.template.getAll();
```

## Caching

In addition to improved developer experience, big reason by SDK exists is
because of the cache handling. If client side caching is not used and all date
is fetch from the backend, client application will be slow with a lot of
loaders.
This will impact application performance. By implementing client-side data
caching layer, application speed can be highly improved.

Data caching can improve application speed and reduce a load to the backend
but it introduces a big problem which is synchronization of the data between
clients and the backend.

### Cache storing

The best way to explain this is with an example. Once logged in, the client
application wants to get all Widgets. This will be done by calling
`sdk.widget.getAll()`. Since this is the first time this method is called, a
network request will be sent to the backend and data will be received. This
data will be stored in memory (Store) and returned to the method caller. Some
time later, the client application will again request all widgets,
but this time when `sdk.widget.getAll()` is called, cache check will occur,
since data is present in the cache, cache data will be returned to the client,
without making a network request. Therefore, the second request will be much
faster, without a delay. At this point in time, the client application wants to
make some changes to a widget, and it will call `sdk.widget.update(updateData)`.
A network request will be sent to the Backend, and it will
respond with an updated widget. The SDK will get the response and update the
specified widget in the cache. If the widget does not exist in the cache, it
will be added to it.

This implementation is easy to understand and implement if there is only 1
client
which is reading and mutating data on the backend. But this is not the case
with the BCMS since more then 1 user can use the application and mutate data.

### Synchronizing cache

To synchronize cache between multiple clients and the backend, SDK uses socket.
When some mutation occurs on the backend, socket event with mutation metadata
will be emitted to all connected clients. When a client receives a socket event,
it will check if mutated data exists in cache, if it does not, event will
be ignored, but if it does, cache item will be removed and updated version
of the data will be requested from the backend.

To explain this in more detail, simple example will be used:

- 2 clients C1 and C2 are using the BCMS.
- C1 will get all widgets
- C2 will get all widgets
- At this point, both C1, C2 and the backend are in sync
- C1 will update some widget by calling `sdk.widget.update(updateData)`
- Mutation of the data will occur on the backend and socket event will be
  emitted to the C2
- C2 will receive the event and check if specified widget exists in cache. This
  check will be true and widget will be removed from the cache. After that, C2
  will call the backend and fetch new widget data and push it to the cache.
