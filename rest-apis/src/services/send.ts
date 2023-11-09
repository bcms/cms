import { v4 as uuidv4 } from 'uuid';
import { DocGroup, DocSection } from '.';
import { securityStore } from '../store';
import { ResponseUtil } from '../util';

export interface SendRequestConfig {
  url: string;
  method: string;
  queries: {
    [name: string]: string;
  };
  headers: {
    [name: string]: string;
  };
  body: any;
}

export async function send(
  server: string,
  groups: DocGroup[],
  section: DocSection,
  sectionIndex: number,
  groupIndex: number
) {
  groups[groupIndex].sections[sectionIndex].loading = true;
  let timeOffset: number = Date.now();
  let requestConfig: SendRequestConfig = {
    url: '',
    body: undefined,
    headers: {},
    queries: {},
    method: section.method,
  };
  try {
    requestConfig.url = '' + section.path;
    for (let i = 0; i < section.params.path.length; i++) {
      const param = section.params.path[i];
      let buffer = requestConfig.url + '';
      while (true) {
        buffer = buffer.replace(`{${param.name}}`, param.value);
        if (buffer === requestConfig.url) {
          break;
        } else {
          requestConfig.url = buffer + '';
        }
      }
    }
    requestConfig.url = `${server}${requestConfig.url}`;
    if (section.params.query.length > 0) {
      for (let i = 0; i < section.params.query.length; i++) {
        const query = section.params.query[i];
        requestConfig.queries[query.name] = query.value;
      }
    }
    if (section.params.header.length > 0) {
      for (let i = 0; i < section.params.header.length; i++) {
        const header = section.params.header[i];
        requestConfig.headers[header.name] = header.value;
      }
    }
    if (section.requestBodies[0].type === 'application/json') {
      requestConfig.headers['Content-Type'] = 'application/json';
      requestConfig.body =
        section.method === 'get' ? undefined : section.requestBodies[0].value;
    } else if (section.requestBodies[0].type === 'multipart/form-data') {
      const fd = new FormData();
      for (let i = 0; i < section.requestBodies[0].value.length; i++) {
        const prop = section.requestBodies[0].value[i];
        if (prop.value) {
          if (prop.type === 'string' && prop.format === 'binary') {
            fd.append(prop.name, prop.value, prop.value.name);
          } else {
            fd.append(prop.name, prop.value);
          }
        }
      }
      requestConfig.body = fd;
    }
    if (section.security && section.security.length > 0) {
      for (let i = 0; i < section.security.length; i++) {
        const sec = section.security[i];
        const security = securityStore.value[sec.name];
        if (security && security.value) {
          if (security.type === 'http') {
            if (security.schema === 'bearer') {
              requestConfig.headers[
                'Authorization'
              ] = `Bearer ${security.value}`;
            } else if (security.schema === 'custom') {
              if (!sec.handler && sec.handlerPath) {
                const scriptRes = await fetch(sec.handlerPath);
                const d = await scriptRes.text();
                const id = 'h' + uuidv4().replace(/-/g, '_');
                eval(d.replace(/window\.__handler_id/g, `window.${id}`));
                sec.handler = (window as any)[id];
              }
              if (sec.handler) {
                requestConfig = await sec.handler({
                  ...requestConfig,
                  value: [security.value],
                });
              }
            }
          }
        }
      }
    }
    let queryString = '';
    const queryNames = Object.keys(requestConfig.queries);
    if (queryNames.length > 0) {
      const buffer: string[] = [];
      for (let i = 0; i < queryNames.length; i++) {
        const queryName = queryNames[i];
        buffer.push(
          `${queryName}=${encodeURIComponent(requestConfig.queries[queryName])}`
        );
      }
      queryString = `?${buffer.join('&')}`;
    }
    timeOffset = Date.now();
    console.log(requestConfig);
    const res = await fetch(`${requestConfig.url}${queryString}`, {
      method: requestConfig.method,
      headers: requestConfig.headers,
      body: requestConfig.body,
    });
    const tte = Date.now() - timeOffset;

    const resHeaders: {
      [key: string]: string;
    } = {};
    res.headers.forEach((value, key) => {
      resHeaders[key] = value;
    });
    if (
      groups[groupIndex].sections[sectionIndex].responses[0].type === 'file'
    ) {
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      groups[groupIndex].sections[sectionIndex].responses[0].value =
        ResponseUtil.prettifyJson(
          JSON.stringify(
            {
              stats: {
                statusCode: res.status + '',
                tte: tte + 'ms',
              },
              headers: resHeaders,
            },
            null,
            '  '
          )
        ) +
        '\n\n' +
        `<img src="${imageUrl}" alt="Image" />`;
    } else {
      groups[groupIndex].sections[sectionIndex].responses[0].value =
        ResponseUtil.format(
          {
            headers: resHeaders,
            data: resHeaders['content-type'].includes('application/json')
              ? await res.json()
              : {
                  blimp__internal: await res.text(),
                },
          },
          {
            statusCode: res.status + '',
            tte: tte + 'ms',
          }
        );
    }
    console.log(requestConfig.url, '->', res);
  } catch (e) {
    const error = e as Error;
    console.error('ERROR', requestConfig.url, '->', error);
    const tte = Date.now() - timeOffset;
    const err = error as any;
    if (err.response) {
      groups[groupIndex].sections[sectionIndex].responses[0].value =
        ResponseUtil.format(err.response, {
          statusCode: err.response.status + '',
          tte: tte + 'ms',
        });
    } else {
      groups[groupIndex].sections[sectionIndex].responses[0].value =
        ResponseUtil.format(
          {
            headers: {},
            data: {
              message: error.message,
              stack: error.stack?.split('\n') || '',
            },
          } as any,
          {
            statusCode: 'unknown',
            tte: tte + 'ms',
          }
        );
    }
  }
  groups[groupIndex].sections[sectionIndex].loading = false;
}
