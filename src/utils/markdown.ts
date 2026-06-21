import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 使用 markedHighlight 插件方式
marked.use({
  async: false,
  pedantic: false,
  gfm: true,
  breaks: true,
  sanitize: false,
});

// 自定义渲染器用于代码高亮
const renderer = {
  code(code: string, language: string | undefined) {
    if (language && hljs.getLanguage(language)) {
      return (
        '<pre><code class="hljs ' +
        language +
        '">' +
        hljs.highlight(code, { language, ignoreIllegals: true }).value +
        '</code></pre>'
      );
    }
    return (
      '<pre><code class="hljs">' +
      hljs.highlightAuto(code).value +
      '</code></pre>'
    );
  },
};

marked.use({ renderer });

export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}
