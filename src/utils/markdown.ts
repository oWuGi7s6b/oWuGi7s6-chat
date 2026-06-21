import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

// 自定义代码块渲染
const renderer = {
  code({ text, lang }: { text: string; lang?: string }) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre><code class="hljs language-' +
          lang +
          '">' +
          hljs.highlight(text, { language: lang }).value +
          '</code></pre>\n'
        );
      } catch (err) {
        console.error('Highlight error:', err);
      }
    }
    return (
      '<pre><code class="hljs">' +
      hljs.highlightAuto(text).value +
      '</code></pre>\n'
    );
  },
};

marked.use({ renderer });

export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}
