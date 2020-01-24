module.exports = {
  prettyName: name => {
    if (name.indexOf('_') !== -1) {
      return name
        .split('_')
        .map(e => {
          return (
            e.substring(0, 1).toUpperCase() +
            e.substring(1, e.length).toLowerCase()
          );
        })
        .join(' ');
    } else {
      return name
        .split('-')
        .map(e => {
          return (
            e.substring(0, 1).toUpperCase() +
            e.substring(1, e.length).toLowerCase()
          );
        })
        .join(' ');
    }
  },

  toUri: value => {
    return value
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/_/g, '-')
      .replace(/[^0-9a-z---]+/g, '');
  },
};
