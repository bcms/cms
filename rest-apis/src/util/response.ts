import { v4 as uuidv4 } from 'uuid';
import { escape } from 'html-escaper';

const wrap = {
  key(value: string) {
    return `<span class="symbol">${escape(
      value.replace(/"/g, '')
    )}</span>:&nbsp;`;
  },
  value(value: string) {
    return `<span class="primitiveType">${escape(value)}</span>`;
  },
  collapse(id: string, value: string): string {
    // blockCollapseScript(id);
    return `<span class="colBtn" title="Collapse" onclick="bcmsRestApisToggleSection(event, '${id}')">${value}</span>`;
  },
};
export class ResponseUtil {
  static format(
    res: {
      headers: any;
      data: any;
    },
    stats: { [key: string]: string }
  ): string {
    return [
      `STATS ----------------------------`,
      this.prettifyJson(JSON.stringify(stats, null, '  ')) + '\n',
      `HEADERS --------------------------`,
      this.prettifyJson(JSON.stringify(res.headers, null, '  ')) + '\n',
      `BODY -----------------------------`,
      this.prettifyJson(JSON.stringify(res.data, null, '  ')) + '\n',
      `----------------------------------`,
    ].join('\n');
  }
  static prettifyJson(json: string): string {
    const output: string[] = [];
    const lines = json.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split('": ');
      if (parts.length === 2) {
        if (parts[1].endsWith('{') || parts[1].endsWith('[')) {
          const id = uuidv4().replace(/-/g, '_');
          output.push(
            `${wrap.collapse(
              id,
              `${wrap.key(parts[0])}${parts[1]}`
            )}<span id="col${id}" class="colBlock">`
          );
        } else {
          output.push(`${wrap.key(parts[0])}${wrap.value(parts[1])}`);
        }
      } else {
        if (line.endsWith('{') || line.endsWith('[')) {
          const id = uuidv4().replace(/-/g, '_');
          output.push(
            `${wrap.collapse(id, line)}<span id="col${id}" class="colBlock">`
          );
        } else if (line.endsWith('}') || line.endsWith(']')) {
          output.push('</span>' + line);
        } else {
          output.push(
            line.endsWith('},') || line.endsWith('],')
              ? '</span>' + line
              : wrap.value(line)
          );
        }
      }
    }
    return output.join('\n');
  }
}
