let __store = JSON.parse(localStorage.getItem('__store'));
let links = [];

if (!__store) {
  __store = {};
}

function write() {
  localStorage.setItem('__store', JSON.stringify(__store));
}

module.exports = {
  get: key => {
    if (!key) {
      return undefined;
    } else {
      switch (typeof __store[key]) {
        case 'object': {
          return JSON.parse(JSON.stringify(__store[key]));
        }
        case 'number': {
          return 0 + __store[key];
        }
        case 'string': {
          return `${__store[key]}`;
        }
        case 'boolean': {
          return __store[key] === true ? true : false;
        }
        case 'undefined': {
          return undefined;
        }
        default: {
          throw new Error(`Unsupported type '${typeof value}'`);
        }
      }
    }
  },
  set: (key, value) => {
    if (typeof key === 'undefined') {
      throw new Error(`'key' cannot be undefined.`);
    }
    if (typeof value === 'undefined') {
      throw new Error(`'value' cannot be undefined.`);
    }
    switch (typeof value) {
      case 'object':
        {
          __store[key] = JSON.parse(JSON.stringify(value));
        }
        break;
      case 'number':
        {
          __store[key] = 0 + value;
        }
        break;
      case 'string':
        {
          __store[key] = `${value}`;
        }
        break;
      case 'boolean':
        {
          __store[key] = value === true ? true : false;
        }
        break;
      default: {
        throw new Error(`Unsupported type '${typeof value}'`);
      }
    }
    if (links[key]) {
      if (links[key].vars) {
        links[key].vars.forEach(e => {
          e = value;
        });
      }
      if (links[key].callbacks) {
        links[key].callbacks.forEach(e => {
          e(value);
        });
      }
    }
    write();
  },
  remove(key) {
    if (!key) {
      throw new Error(`'key' cannot be undefined.`);
    }
    if (__store[key]) {
      delete __store[key];
      __store = JSON.parse(JSON.stringify(__store));
      write();
    }
  },
  clear: () => {
    __store = {};
    write();
  },
  link(key, variable) {
    if (links[key]) {
      links[key].vars.push(variable);
    } else {
      links[key] = {
        vars: [variable],
      };
    }
  },
  setCallback(key, callback) {
    if (typeof callback !== 'function') {
      throw new Error(`'callback' must be a function.`);
    }
    if (links[key]) {
      links[key].callbacks.push(callback);
    } else {
      links[key] = {
        callbacks: [callback],
      };
    }
  },
};
