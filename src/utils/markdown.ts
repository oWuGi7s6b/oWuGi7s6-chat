import { marked } from 'marked';

// 配置 marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function parseMarkdown(content: string): string {
  return marked.parse(content) as string;
}
