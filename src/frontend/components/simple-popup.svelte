<script context="module">
  export const simplePopup = {
    info: () => {},
    success: () => {},
    error: () => {},
    hide: () => {},
  };
</script>

<script>
  const data = {
    color: 'var(--c-primary)',
    position: '-350px',
  };

  let timer;

  simplePopup.hide = () => {
    clearTimeout(timer);
    data.position = '-350px';
  };

  simplePopup.info = (message) => {
    message = styleContent(message);
    document.getElementById('simple-popup-info').innerHTML = message;
    data.color = 'var(--c-primary);';
    data.position = '20px';
  }

  simplePopup.error = (message) => {
    document.getElementById('simple-popup-info').innerHTML = message;
    data.color = 'var(--c-error)';
    data.position = '20px';
    setTimeout(simplePopup.hide, 8000);
  }

  simplePopup.success = (message) => {
    document.getElementById('simple-popup-info').innerHTML = message;
    data.color = 'var(--c-success)';
    data.position = '20px';
    setTimeout(simplePopup.hide, 8000);
  }

  const contentStyle = {
    h1: `
      margin: 0;
      padding: 0;
    `,
    h2: `
      margin: 0;
      padding: 0;
    `,
    h3: `
      margin: 0;
      padding: 0;
    `,
    h4: `
      margin: 0;
      padding: 0;
    `,
    h5: `
      margin: 0;
      padding: 0;
    `,
  }

  function styleContent(content) {
    for(const key in contentStyle) {
      content = content.replace(new RegExp(`<${key}>`, 'g'), `<${key} style='${contentStyle[key]}'>`);
    }
    return content;
  }
</script>

<style>
  .simple-popup {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 300px;
    font-size: 11pt;
    border: none;
    border-radius: 5px;
    box-shadow: -5px 5px 10px rgba(0, 0, 0, 0.2);
    transition: 0.8s;
    overflow: hidden;
    z-index: 100;
  }

  .simple-popup .simple-popup-info {
    padding: 5px 7px;
    transition: 0.4s;
    color: var(--c-white);
  }

  .simple-popup .simple-popup-info:hover {
    background-color: var(--light-gray-shadow);
    cursor: pointer;
  }
</style>

<div id="simple-popup" class="simple-popup" style="right: {data.position};">
  <div
    id="simple-popup-info"
    class="simple-popup-info"
    style="background-color: {data.color};"
    on:click={simplePopup.hide}>
    Some Message
  </div>
</div>
