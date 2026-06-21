import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 配置marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 代码高亮
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}
