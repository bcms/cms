# Becomes CMS

- [Introduction](#introduction)
  - [Terminology](#terminology)
  - [Short Examples](#short-examples)
- [Back-end](#back-end)
  - [User](#user)
    - [Role]()
    - [Permission]()
  - [Auth]()
    - [JWT]()
    - [API Key]()
  - [Template]()
    - [Properties]()
  - [Entry]()
  - [Group]()
  - [Widget]()
  - [Media]()
  - [Function]()
    - [Webhook function]()
  - [Webhook]()
  - [Events]()
- [Dashboard]()
  - [Template Manager]()
  - [Group Manager]()
  - [Widget Manager]()
  - [Language Manager]()
  - [Users Manager]()
  - [API Manager]()
  - [Webhook Manager]()
  - [Webhooks]()
  - [Entries]()
    - [Viewing]()
    - [Editing]()

<div id="introduction"></div>

## Introduction

This is a small CMS developed by company [Becomes](https://becomes.co) that is specialized for building APIs. It was created because of project needs in our company and we decided to make it Open-Source since it solved a lot of problems that we had with other CMS solutions. We hope that you will find it useful in your next project.

- **What Becomes CMS is not?**
  - It is not replacement for [WordPress](https://wordpress.com/) - WordPress is used for creating websites while Becomes CMS is used for creating APIs that will be consumed by other services. In this regard, they are completely different.
  - It is not Website generator - As said in previous point, Becomes CMS is used for creating APIs that will be consumed by some other service. You cannot create web pages publicly accessible over Becomes CMS.
  - It is not replacement for highly specialized APIs - Altho you can create any data model using Becomes CMS and manage them thru interactive dashboard, it is not designed to replace an API where very high performance is required.
- **What is Becomes CMS?**
  - In one sentence, it is highly flexible and interactive tool for creating APIs that will be consumed by services other services.

<div id="terminology"></div>

### Terminology

In this document, few "special" will be used and they have specific meaning.

- **Template** - It is a *container* that holds information about how new Entry should be created, it structure and how it should behave. In addition to that, Template is holding pointers to all available Entries. By itself, Template is nothing more then a template for creating Entries and keeping them in sync with each other, therefore the name is as it is. Template also dictates type of an Entry that can be created by it:
  - **Data Modal** - This type defines that Entry is a "primitive" object, like plane JSON object (not actually but close enough). Example is a web store item, order, subscription or any other object that can be represented using key-value pairs.
  - **Rich Content** - This type defines that Entry is a "complex" object and it extends Data Model type. This means that in addition to key-value pairs, it also has User editable rich content. Some examples are: blog post, case study post or any other type of content that will be consumed by humans in readable form.
- **Entry** - It is an object that holds actual data in structured way that is useful to a consumer of the CMS API. The structure is defined by Template.
- **Group** - It is a placeholder object for creating complex and nested properties in Entry. For example, if it is required for Entry to have object property (non primitive one, like string, number...) Group is used to achieve this.
- **User** - It is an entity which is authorized to access CMS dashboard. User can have roles: ADMIN or USER (more information in [Users](#users) section).
- **Widget** - It is a special placeholder object that can be only used in Entries of type Rich Content.
- **Webhook** - It is a special object that can be configured to trigger CMS API function called webhook.
- **Function** - 

By showing some examples this terminology might be easier to understand.

<div id="short-examples"></div>

### Short Examples

> Example 1 - Using CMS to create a Blog website.

The core function of a blog website is a Blog Post. Every blog post on a website follows the same structure: title, cover image, author and content. Only thing that is different between 2 blog posts is the content. Therefore, in this example, Template is defining blog post structure (title property is of type string, cover image is of type string, author is of type Group and so one) while Entry is a single Blog Post and this means that it is holding values for properties defined in Template (title is "My first blog", cover image is "/image.png", author is "{name: "Tom", position: "CEO"}" and so one).

> Example 2 - Using CMS to create a simple web store.

The core function of a web store is an Item. To make it as simple as possible this online store is selling 2 Item types: Books and Makers. Books will be defined by creating a Template with properties: name `<string>`, title `<string>` and author `<string>` while Markers will be defined by creating a new Template with properties: name `<string>`, price `<number>` and quantity `<number>`. With this done Book Entry and Marker Entry can be added since structure is defined by Books Template and Markers Template respectively.

<div id="back-end"></div>

## Back-end

Becomes CMS can be split into 2 parts, Back-end part that is built using [Purple Cheetah](https://purple-cheetah.com) framework and Front-end part that is built using [Svelte](https://svelte.dev).

<div id="user"></div>

### User

It is a special model used to describe a CMS user which is a person. If it is required for service or robot to be able to access CMS content, it is highly recommended to use [API Key]() for that since its access level can be restricted. Every User must have unique email and strong password. Email does not have to be valid but it has to be unique.


## Becomes CMS Back-end - BCB

Core functionality is based on 2 paradimes, `Template` and `Entry`.

- Template is a 'container' that specifies how Entry should be created and points to all Entries created using it.
- Entry is a data that holds values in structured way which can be consumed.

For example, simple blog can be used to describe those paradimes. By braking down any blog, it can be seen that it consists of 2 parts, Blog Template and Blog Content. Blog Content is actual blog post that has headings, paragraphs, images and so one, while Blog Template is information about how blog post is structured. It gives an information about layout, meta, how content is structured and information about what is allowed when creating new blog post. In this example, Blog Template is a `Template` and Blog Content is an `Entry`.

A different example can be a web shop that is selling speakers. Every speaker in store can be described by its: width, height, driver size, driver impedance, crossover and so one. `Template` describes speaker and its properties. Actual values for those properties are stored in `Entry` that is representing specific speaker itself.

It can be said that `Template` and `Entry` are generic types which structure allow accuret description of other, unknown object.

### Going deeper

When creating new `Template`, it is stored in database with its `unique name`, `identifier`, `timestamp` and `entry template`. This action will allow API access to this resource via `/template/{template_id}`. At this point Entry can be created. When submitting an `Entry` its data model will be compared with `entry template` in coresponding Template. If comparison in good, Entry will be added to database with its `identifier`, `timestamp` and `properties`. In addition to this, Entry identifier will be added to its Template. This action will allow API access to this resource via `/template/{template_id}/entry/{entry_id}`.

## API

All routes are protected via API Security mechanism which uses sort of HTTP signature for authentication. 

In CMS dashboard (if user is logged in as admin), in API Manager section, user is able to create API Key. Also, user can assign level for every Key.

### Security

For client to make successful request to an API, every request must be signed using API Key. Authentication is done via query parameters and they are:

- **key** - ID of the key that is used to create signature,
- **nonce** - Random string of 6 characters,
- **timestamp** - Current time in milliseconds,
- **signature** - HMAC-SHA256 hash that is constructed from request parameters.

Those values are parsed in a request as a query parameters while values can be created using package (`npm i --save @becomes/cms-client`) or by doing it yourself as explained below.

> Using package

More information can be found in [NPM Repository]() but in short, `@becomes/cms-client` provides a class classed **BCCSecurity** with methods **sign** and **signAndSend**. Sign method will return object with all information required to send a request to an API, while signAndSend will create signature, send request to an API and return a response.

```js
  const reqQueryObject = BCCSecurity.sign({
    key: {
      id: 'KEY_ID',
      secret: 'KEY_SECRET'
    },
    payload: {
      // Some payload
    }
  });
  console.log(reqQueryObject);
  // {
  //  key: string,
  //  nonce: string,
  //  timestamp: number,
  //  signature: string
  // }
```

> Creating signature

To create valid signature, few steps must be followed.

- Create a nonce - this can be done using [CryptoJS]() package: `CryptoJS.lib.WordArray.random(6).toString()`,
- Create **payload** string - This string is created by converting payload into BASE64 string.
  - If there is no payload - `payloadAsString = Base64(Stringify({}))`,
  - If payload is object - `payloadAsString = Base64(Stringify(payload))`,
  - If payload is string - `payloadAsString = Base64(payload)`,
- Create a string that will be hashed - this is done by concatenating string is specific order: `nonce + timestamp + KEY_ID + payloadAsString`,
- Create a signature hash - This is done using HMAC-SHA256 algorithm with Key Secret.

With this done, request can be successfully send. Bellow is TypeScript code for creating signature.

```ts
  function sign(config: {
    key: {
      id: string;
      secret: string;
    };
    payload: any;
  }): APISecurityObject {
    const data: APISecurityObject = {
      key: config.key.id,
      timestamp: Date.now(),
      nonce: crypto
        .randomBytes(16)
        .toString('hex')
        .substring(0, 6),
      signature: '',
    };
    let payloadAsString: string = '';
    if (typeof config.payload === 'object') {
      payloadAsString = Buffer.from(JSON.stringify(config.payload)).toString(
        'base64',
      );
    } else {
      payloadAsString = '' + config.payload;
    }
    const hmac = crypto.createHmac('sha256', config.key.secret);
    hmac.update(data.nonce + data.timestamp + data.key + payloadAsString);
    data.signature = hmac.digest('hex');
    return data;
  }
```

### Routes

> Get all templates

```text
  Method: GET
  URI:    /template/all
```