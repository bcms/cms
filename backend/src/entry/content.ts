import {
    type EntryContentNode,
    type EntryContentNodeHeadingAttr,
    EntryContentNodeMarkerType,
    EntryContentNodeType,
} from '@bcms/selfhosted-backend/entry/models/content';

export function entryContentNodeToHtml(node: EntryContentNode): string {
    let output = '';
    if (node.type === 'widget') {
        output = `<div style="display: none" data-bcms-node-widget="true">${node.text}</div>`;
    } else {
        if (node.type === EntryContentNodeType.text && node.text) {
            output = node.text;
            if (node.marks) {
                for (let j = 0; j < node.marks.length; j++) {
                    const mark = node.marks[j];
                    if (
                        mark.type === EntryContentNodeMarkerType.link &&
                        mark.attrs
                    ) {
                        output = `<a href="${mark.attrs.href}" target="${mark.attrs.target}">${output}</a>`;
                    }
                    if (mark.type === EntryContentNodeMarkerType.bold) {
                        output = `<strong>${output}</strong>`;
                    }
                    if (mark.type === EntryContentNodeMarkerType.italic) {
                        output = `<i>${output}</i>`;
                    }
                    if (mark.type === EntryContentNodeMarkerType.strike) {
                        output = `<s>${output}</s>`;
                    }
                    if (mark.type === EntryContentNodeMarkerType.underline) {
                        output = `<u>${output}</u>`;
                    }
                    if (mark.type === EntryContentNodeMarkerType.inlineCode) {
                        output = `<code>${output}</code>`;
                    }
                }
            }
        } else if (
            node.type === EntryContentNodeType.paragraph &&
            node.content
        ) {
            output = `<p>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</p>`;
        } else if (
            node.type === EntryContentNodeType.heading &&
            node.attrs &&
            node.content
        ) {
            const level = (node.attrs as EntryContentNodeHeadingAttr).level;
            output = `<h${level}>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</h${level}>`;
        } else if (
            node.type === EntryContentNodeType.bulletList &&
            node.content
        ) {
            output = `<ul>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</ul>`;
        } else if (
            node.type === EntryContentNodeType.listItem &&
            node.content
        ) {
            output = `<li>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</li>`;
        } else if (
            node.type === EntryContentNodeType.orderedList &&
            node.content
        ) {
            output = `<ol>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</ol>`;
        } else if (
            node.type === EntryContentNodeType.codeBlock &&
            node.content
        ) {
            output = `<pre><code>${node.content
                .map((childNode) => entryContentNodeToHtml(childNode))
                .join('')}</code></pre>`;
        } else if (node.type === EntryContentNodeType.hardBreak) {
            output = '<br />';
        }
    }
    return output;
}
