import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

// 配置 marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function parseMarkdown(content: string): string {
  const html = marked.parse(content, {
    async: false,
  }) as string;
  
  // 手动添加代码高亮
  return html.replace(/<code class="language-([^"]*)">([^<]+)<\/code>/g, (match, lang, code) => {
    try {
      if (lang && hljs.getLanguage(lang)) {
        const highlighted = hljs.highlight(code, { language: lang }).value;
        return `<code class="hljs language-${lang}">${highlighted}</code>`;
      }
    } catch (e) {
      console.error('Highlight error:', e);
    }
    const highlighted = hljs.highlightAuto(code).value;
    return `<code class="hljs">${highlighted}</code>`;
  });
}