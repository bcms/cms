const axios = require('axios');

let createInstance = function() {
  var global = {
    baseURL: '',
    headers: {},
    queries: {},
    preRequestFunction: async function(config) {
      return config;
    },
  };

  var checkInput = function(config) {
    if (!config) {
      return "'config' parameter was not provided.";
    }
    if (!config.url || typeof config.url !== 'string') {
      return "Missing property 'url: string'";
    }
    if (!config.method || typeof config.method !== 'string') {
      return "Missing property 'method: string'";
    }
    return 'good';
  };

  return {
    config: function(config) {
      if (config.baseURL && typeof config.baseURL === 'string') {
        global.baseURL = config.baseURL;
      }
      if (config.headers && typeof config.headers === 'object') {
        for (let key in config.headers) {
          global.headers[key] = config.headers[key];
        }
      }
      if (config.queries && typeof config.queries === 'object') {
        for (let key in config.queries) {
          global.queries[key] = config.queries[key];
        }
      }
      if (
        config.preRequestFunction &&
        typeof config.preRequestFunction === 'function'
      ) {
        global.preRequestFunction = config.preRequestFunction;
      }
    },
    send: async function(config) {
      let data;
      if (config.data && typeof config.data === 'object') {
        data = config.data;
        if (config.headers) {
          config.headers['Content-Type'] = 'application/json';
        } else {
          config.headers = {
            'Content-Type': 'application/json',
          };
        }
      }
      try {
        config = await global.preRequestFunction(config);
      } catch (error) {
        return {
          success: false,
          error,
        };
      }
      var check = checkInput(config);
      if (check !== 'good') {
        throw new Error(check);
      }
      try {
        const response = await axios({
          method: config.method,
          url: global.baseURL + config.url,
          headers: config.headers,
          data,
        });
        return {
          success: true,
          response,
        };
      } catch (error) {
        return {
          success: false,
          error,
        };
      }
    },
  };
};

let jwtAutoRefreshPreRequestFunction = function(
  store,
  refreshTokenUrl,
  loginPageUrl,
) {
  const refreshTokenAxiosClient = createInstance();

  return async function(config) {
    if (!store.get('accessToken')) {
      // window.location = loginPageUrl + '?error=Missing `accessToken` in store.';
      return;
    }
    if (!store.get('refreshToken')) {
      // window.location =
      //   loginPageUrl + '?error=Missing `refreshToken` in store.';
      return;
    }
    const accessTokenPayload = JSON.parse(
      atob(store.get('accessToken').split('.')[1]),
    );

    if (accessTokenPayload.iat + accessTokenPayload.exp < Date.now()) {
      console.log('Refreshing');
      try {
        const result = await refreshTokenAxiosClient.send({
          url: refreshTokenUrl,
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + store.get('refreshToken'),
          },
        });
        if (result.success === false) {
          if (result.error.response.status === 401) {
            store.set('loggedIn', false);
            store.remove('refreshToken');
            store.remove('accessToken');
            store.remove('user');
            window.location =
              loginPageUrl + `?error=Failed to refresh an access token.`;
          } else {
            throw new Error(result.error.response);
          }
        }
        if (!config.headers) {
          config.headers = {
            Authorization: 'Bearer ' + result.response.data.accessToken,
          };
        } else {
          config.headers.Authorization =
            'Bearer ' + result.response.data.accessToken;
        }
        store.set('accessToken', result.response.data.accessToken);
        return config;
      } catch (error) {
        throw error;
      }
    } else {
      if (!config.headers) {
        config.headers = {
          Authorization: 'Bearer ' + store.get('accessToken'),
        };
      } else {
        config.headers.Authorization = 'Bearer ' + store.get('accessToken');
      }
    }
    return config;
  };
};

const AxiosClient = {
  instance: createInstance,
  jwtAutoRefreshPreRequestFunction,
};

module.exports = AxiosClient;
