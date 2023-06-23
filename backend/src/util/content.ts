import {
  BCMSEntryContentNodeType,
  BCMSEntryContentNodeMarkerType,
  BCMSEntryContentNodeHeadingAttr,
  BCMSPropValueWidgetData,
  BCMSEntryContentNode,
} from '../types';

export class BCMSContentUtility {
  static nodeToHtml({ node }: { node: BCMSEntryContentNode }): string {
    let output = '';
    if (node.type !== 'widget') {
      if (node.type === BCMSEntryContentNodeType.text && node.text) {
        output = node.text;
        if (node.marks) {
          for (let j = 0; j < node.marks.length; j++) {
            const mark = node.marks[j];

            if (
              mark.type === BCMSEntryContentNodeMarkerType.link &&
              mark.attrs
            ) {
              output = `<a href="${mark.attrs.href}" target="${mark.attrs.target}">${output}</a>`;
            }
            if (mark.type === BCMSEntryContentNodeMarkerType.bold) {
              output = `<strong>${output}</strong>`;
            }
            if (mark.type === BCMSEntryContentNodeMarkerType.italic) {
              output = `<i>${output}</i>`;
            }
            if (mark.type === BCMSEntryContentNodeMarkerType.strike) {
              output = `<strike>${output}</strike>`;
            }
            if (mark.type === BCMSEntryContentNodeMarkerType.underline) {
              output = `<u>${output}</u>`;
            }
            if (mark.type === BCMSEntryContentNodeMarkerType.inlineCode) {
              output = `<code>${output}</code>`;
            }
          }
        }
      } else if (
        node.type === BCMSEntryContentNodeType.paragraph &&
        node.content
      ) {
        output = `<p>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</p>`;
      } else if (
        node.type === BCMSEntryContentNodeType.heading &&
        node.attrs &&
        node.content
      ) {
        const level = (node.attrs as BCMSEntryContentNodeHeadingAttr).level;
        output = `<h${level}>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</h${level}>`;
      } else if (
        node.type === BCMSEntryContentNodeType.bulletList &&
        node.content
      ) {
        output = `<ul>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</ul>`;
      } else if (
        node.type === BCMSEntryContentNodeType.listItem &&
        node.content
      ) {
        output = `<li>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</li>`;
      } else if (
        node.type === BCMSEntryContentNodeType.orderedList &&
        node.content
      ) {
        output = `<ol>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</ol>`;
      } else if (
        node.type === BCMSEntryContentNodeType.codeBlock &&
        node.content
      ) {
        output = `<pre><code>${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToHtml({ node: childNode }),
          )
          .join('')}</code></pre>`;
      } else if (node.type === BCMSEntryContentNodeType.hardBreak) {
        output = '<br />';
      }
    } else {
      throw Error('Node of type widget cannot be converted to HTML.');
    }
    return output;
  }

  static nodeToText({ node }: { node: BCMSEntryContentNode }): string {
    let output = '';
    if (node.type === 'widget') {
      const attrs = node.attrs as BCMSPropValueWidgetData;
      output += '__widget' + JSON.stringify(attrs);
    } else {
      if (node.type === BCMSEntryContentNodeType.text && node.text) {
        output += node.text;
      } else if (
        node.type === BCMSEntryContentNodeType.paragraph &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}\n`;
      } else if (
        node.type === BCMSEntryContentNodeType.heading &&
        node.attrs &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.bulletList &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.listItem &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.orderedList &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}`;
      } else if (
        node.type === BCMSEntryContentNodeType.codeBlock &&
        node.content
      ) {
        output += `${node.content
          .map((childNode) =>
            BCMSContentUtility.nodeToText({ node: childNode }),
          )
          .join('')}`;
      }
    }
    return output;
  }
}
