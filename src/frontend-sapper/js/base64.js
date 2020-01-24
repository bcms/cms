module.exports = {
  encode: s => {
    return btoa(s).replace(/=/g, '');
  },
  decode: s => {
    return atob(s);
  },
};
