# BCMS SDK

The idea behind this module is to abstract API communication for BCMS UI developers. Without this module, UI developers would have to implement REST API calls for the Backend module and take care of caching and storing data. This is not an easy task; therefore, this module is developed to allow UI developers to focus on the interface and user experience without worrying about request payload size, streams, and sockets.

With this in mind, the BCMS SDK is an abstraction layer between UI and Backend of the BCMS. Some of the things that this module covers are:

- Cache layer - caching is done in memory, which means that data is available only during the same session. If a browser tab is reloaded, the cache is lost.
- Authentication - there is no need to worry about security tokens and lifecycles.
- Communication with Backend API - there is no need to make HTTP requests; just use abstract methods to get data, like, for example, `sdk.template.getAll()` to get all available templates.
- Sockets - data synchronization is also handled, and the cache will always be in sync with other sessions.
- The cache is connected with the Vue store; therefore, computed methods are very powerful.

## Getting started

The SDK is integrated in the UI and is available via: `window.bcms.sdk.*`.

## Caching

A big part of the SDK functionality is data caching. Cache is useful to minimize the number of requests to the Backend server, reduce internet usage and make better-performing UI. This is done by sending one request to get specified data, and then a copy of the data is stored locally. When data is requested again, the request does not need to be sent to the Backend since data is already present in the memory. This means that performance is much faster, and network payload over time is much smaller. This is nice to have but tricky to implement and understand, even more when multiple clients can consume the application at the same time, which is the case with the BCMS. Caching is awesome, but it needs to be synchronized with the data on the Backend and between clients. To illustrate how BCMS SDK Cache works, one use case will be covered.

Once logged in, the client application wants to get all Widgets. This will be done by calling `sdk.widget.getAll()`. Since this is the first time this method is called, a network request will be sent to the Backend, and data will be received. This data will be stored in memory, and a copy of the data will be returned to the client. Some time later, the client application will again request all widgets, but this time when `sdk.widget.getAll()` is called, cache check will occur, and since data is present in the cache, a copy of it will be returned to the client, without making a network request. Therefore, the second request will be much faster, without a delay. At this point in time, the client application wants to make some changes to a widget, and it will call `sdk.widget.update(myUpdatedWidget)`. A network request will be sent to the Backend, and it will respond with the updated widget. The SDK will get the response and update the specified widget in the cache. If the widget does not exist in the cache, it will be added to it. For a single client application use case, this is pretty straightforward because the only way that something can change on the Backend is by a single client, and SDK will know about the change. Complexity arises when more than one client application is connected to the same Backend at the same time.

For simplicity reasons, there will be only two client applications connected at the same time, called C1 and C2. Both clients will get all widgets. At this point, both C1 and C2 have synchronized cache with the Backend, problem arises when C1 updates a widget. Without some mechanism to inform C2 that a widget is updated, C2's cache will not be synchronized with the Backend, and weird problems can occur because of this. In BCMS SDK, this problem is solved using sockets. Once some sort of an update occurs on the Backend, an event with the update will be sent to all active sockets. This way, C2 will be informed that an update of a widget has happened, and it will fetch it, synchronizing data with the Backend. The client application can also know about this update (for example, this can be important if data on the screen needs to be re-rendered or a user needs to be informed about an update) by subscribing to a socket event using `sdk.socket.subscribe(eventName, handler)`.

In short, caching is tricky and supported by the SDK; therefore, the client application does not need to worry about it.
