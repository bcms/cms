<script context="module">
  export const folderTreeActions = {
    setActive: path => {},
    getFolderTree: () => {},
    render: () => {},
  };
  export const folderTreeType = {
    DIR: { value: 'DIR', faClass: 'fas fa-folder icon' },
    IMG: { value: 'IMG', faClass: 'fas fa-image icon' },
    VID: { value: 'VID', faClass: 'fas fa-video icon' },
    TXT: { value: 'TXT', faClass: 'fas fa-file-alt icon' },
    GIF: { value: 'GIF', faClass: 'fas fa-smile-beam icon' },
    OTH: { value: 'OTH', faClass: 'fas fa-file icon' },
    PDF: { value: 'PDF', faClass: 'fas fa-file-pdf icon' },
    CODE: { value: 'CODE', faClass: 'fas fa-code icon' },
    FONT: { value: 'FONT', faClass: 'fas fa-font icon' },

    JS: { value: 'JS', faClass: 'fab fa-js-square icon' },
    HTML: { value: 'HTML', faClass: 'fab fa-html5 icon' },
    CSS: { value: 'CSS', faClass: 'fab fa-css3-alt icon' },
    JSVS: { value: 'JAVA', faClass: 'fab fajava icon' },
    PHP: { value: 'PHP', faClass: 'fab fa-php icon' },
  };
</script>

<script>
  import { onMount } from 'svelte';
  import { simplePopup } from '../simple-popup.svelte';

  export let Store;
  export let axios;
  export let events;

  let folderTree = [];

  function toggleChildren(ft, state) {
    ft.children.forEach(child => {
      if (state === true) {
        document.getElementById(child._id).style.display = 'block';
      } else {
        document.getElementById(child._id).style.display = 'none';
        if (child.children) {
          toggleChildren(child);
        }
      }
    });
  }
  function folderTreeToDomElements(ft, level) {
    if (!level) {
      level = 2;
    }
    const dirStyle = `padding-left: ${10 * level}px;`;
    const fileStyle = `padding-left: ${10 * level}px;`;
    ft.sort((a, b) => {
      if (a.type === 'DIR' && b.type !== 'DIR') {
        return -1;
      } else if (a.type !== 'DIR' && b.type === 'DIR') {
        return 1;
      }
      return 0;
    });
    const elements = [];
    if (level === 2) {
      let element = document.createElement('button');
      const iconElement = document.createElement('span');
      iconElement.setAttribute('class', 'fas fa-home icon');
      const nameElement = document.createElement('span');
      nameElement.setAttribute('class', 'text');
      nameElement.innerHTML = 'root';
      element.setAttribute('class', 'dir');
      element.setAttribute('style', `padding-left: 10px;`);
      element.addEventListener('click', () => {
        if (events && events.click) {
          events.click(
            'dir',
            element,
            {
              path: '/',
              name: 'root',
              type: 'DIR',
              children: folderTree,
            },
            true,
          );
        }
      });
      element.appendChild(iconElement);
      element.appendChild(nameElement);
      elements.push(element);
    }
    ft.forEach(e => {
      let element = document.createElement('button');
      const iconElement = document.createElement('span');
      iconElement.setAttribute('class', folderTreeType[e.type].faClass);
      iconElement.setAttribute('id', `${e._id}_icon`);
      const nameElement = document.createElement('span');
      nameElement.setAttribute('class', 'text');
      nameElement.setAttribute('id', `${e._id}_name`);
      nameElement.innerHTML = shortenName(e.name, 30);
      element.setAttribute('id', e._id);
      if (e.type === 'DIR') {
        element.setAttribute('class', 'dir');
        element.setAttribute('style', dirStyle);
        element.addEventListener('click', () => {
          if (e.state === false) {
            e.state = true;
            iconElement.setAttribute('class', 'fas fa-folder-open icon');
          } else {
            e.state = false;
            iconElement.setAttribute('class', folderTreeType[e.type].faClass);
          }
          toggleChildren(e, e.state);
          if (events && events.click) {
            events.click('dir', element, e);
          }
        });
      } else {
        element.setAttribute('class', 'file');
        element.setAttribute('style', fileStyle);
        element.addEventListener('click', () => {
          if (events && events.click) {
            events.click('file', element, e);
          }
        });
      }
      element.appendChild(iconElement);
      element.appendChild(nameElement);
      elements.push(element);
      if (e.children) {
        folderTreeToDomElements(e.children, level + 1).forEach(t => {
          t.style.display = 'none';
          elements.push(t);
        });
      }
    });
    return elements;
  }
  function render(elements) {
    document.getElementById('folder-tree').innerHTML = '';
    elements.forEach(e => {
      document.getElementById('folder-tree').appendChild(e);
    });
  }
  function findFolderByPath(fTree, path) {
    if (fTree.length) {
      for (const i in fTree) {
        const ft = fTree[i];
        if (ft.path === path) {
          return ft;
        }
        if (ft.children) {
          const f = findFolderByPath(ft.children, path);
          if (f) {
            return f;
          }
        }
      }
    } else if (fTree.children) {
      const f = findFolderByPath(ft.children, path);
      if (f) {
        return f;
      }
    } else {
      if (fTree.path === path) {
        return fTree;
      }
    }
    return undefined;
  }
  function shortenName(name, lng) {
    if (name.length > lng) {
      const parts = name.split('.');
      if (parts.length > 1) {
        const ext = parts.slice(parts.length - 1, parts.length);
        const other = parts.slice(0, parts.length - 1).join('.');
        return `${other.substring(0, lng - 3)} ...${ext}`;
      } else {
        return `${name.substring(0, lng - 3)} ...`;
      }
    } else {
      return name;
    }
  }
  async function getMedia() {
    const result = await axios.send({
      url: '/media/all/aggregate',
      method: 'GET',
    });
    if (result.success === false) {
      simplePopup.error(result.error.response.data.message);
      return;
    }
    folderTree = result.response.data.media;
  }

  folderTreeActions.setActive = item => {
    let path = '';
    if (item.type === 'DIR') {
      path = item.path;
    } else {
      window.open(
        `/media/file?path=${encodeURIComponent(
          item.path + '/' + item.name,
        )}&access_token=${Store.get('accessToken')}`,
        '_blank',
      );
    }
    const ft = findFolderByPath(folderTree, item.path);
    if (ft && events && events.click) {
      if (ft.state === false) {
        ft.state = true;
        document
          .getElementById(`${ft._id}_icon`)
          .setAttribute('class', 'fas fa-folder-open icon');
      } else {
        ft.state = false;
        document
          .getElementById(`${ft._id}_icon`)
          .setAttribute('class', folderTreeType[ft.type].faClass);
      }
      toggleChildren(ft, ft.state);
      events.click('dir', document.getElementById(ft._id), ft);
    }
  };
  folderTreeActions.getFolderTree = () => {
    return JSON.parse(JSON.stringify(folderTree));
  };
  folderTreeActions.render = async () => {
    await getMedia();
    render(folderTreeToDomElements(folderTree));
  };
  onMount(async () => {
    await getMedia();
    render(folderTreeToDomElements(folderTree));
    if (events && events.init) {
      events.init(folderTree);
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href="/css/folder-tree.css" />
</svelte:head>

<div class="folder-tree">
  <div class="heading">EXPLORER</div>
  <div id="folder-tree" class="tree" />
</div>
