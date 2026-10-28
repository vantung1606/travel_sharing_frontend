import React from 'react';
import { Bold, Italic, Heading2, Quote, List, Code, Link as LinkIcon } from 'lucide-react';
import { renderTextWithMentions } from './MentionSuggestions';

/**
 * Utility: Áp dụng định dạng Markdown vào vị trí con trỏ hoặc chuỗi text đang được bôi đen
 */
export const applyFormatToTextarea = (textarea, formatType, currentValue = '', onChange) => {
  if (!textarea) return;
  const start = textarea.selectionStart ?? currentValue.length;
  const end = textarea.selectionEnd ?? currentValue.length;
  const selectedText = currentValue.substring(start, end);
  let replacement = '';
  let newCursorStart = start;
  let newCursorEnd = end;

  switch (formatType) {
    case 'bold':
      replacement = `**${selectedText || 'văn bản in đậm'}**`;
      newCursorStart = start + 2;
      newCursorEnd = selectedText ? end + 2 : start + 2 + 'văn bản in đậm'.length;
      break;
    case 'italic':
      replacement = `*${selectedText || 'văn bản in nghiêng'}*`;
      newCursorStart = start + 1;
      newCursorEnd = selectedText ? end + 1 : start + 1 + 'văn bản in nghiêng'.length;
      break;
    case 'heading': {
      const needsPrefixNewline = start > 0 && currentValue[start - 1] !== '\n';
      replacement = `${needsPrefixNewline ? '\n' : ''}### ${selectedText || 'Tiêu đề'}\n`;
      newCursorStart = start + (needsPrefixNewline ? 5 : 4);
      newCursorEnd = selectedText ? end + (needsPrefixNewline ? 5 : 4) : newCursorStart + 'Tiêu đề'.length;
      break;
    }
    case 'quote': {
      const needsPrefixNewline = start > 0 && currentValue[start - 1] !== '\n';
      replacement = `${needsPrefixNewline ? '\n' : ''}> ${selectedText || 'Lời trích dẫn...'}\n`;
      newCursorStart = start + (needsPrefixNewline ? 3 : 2);
      newCursorEnd = selectedText ? end + (needsPrefixNewline ? 3 : 2) : newCursorStart + 'Lời trích dẫn...'.length;
      break;
    }
    case 'list': {
      const needsPrefixNewline = start > 0 && currentValue[start - 1] !== '\n';
      replacement = `${needsPrefixNewline ? '\n' : ''}- ${selectedText || 'Mục danh sách'}\n`;
      newCursorStart = start + (needsPrefixNewline ? 3 : 2);
      newCursorEnd = selectedText ? end + (needsPrefixNewline ? 3 : 2) : newCursorStart + 'Mục danh sách'.length;
      break;
    }
    case 'code':
      replacement = `\`${selectedText || 'đoạn mã'}\``;
      newCursorStart = start + 1;
      newCursorEnd = selectedText ? end + 1 : start + 1 + 'đoạn mã'.length;
      break;
    case 'link':
      replacement = `[${selectedText || 'Tiêu đề liên kết'}](https://)`;
      newCursorStart = start + (selectedText ? selectedText.length + 3 : 19);
      newCursorEnd = newCursorStart + 8;
      break;
    default:
      return;
  }

  const nextValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);
  onChange(nextValue);

  setTimeout(() => {
    try {
      textarea.focus();
      textarea.setSelectionRange(newCursorStart, newCursorEnd);
    } catch {}
  }, 25);
};

/**
 * Thanh công cụ định dạng chữ phong phú (Rich Text Formatting Toolbar)
 */
export const RichTextToolbar = ({ textareaRef, value = '', onChange, className = '' }) => {
  const handleFormat = (type) => {
    applyFormatToTextarea(textareaRef?.current, type, value, onChange);
  };

  return (
    <div className={`flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-[#F6F1E8] border border-[#1E1A15]/10 border-b-0 rounded-t-sm text-ink-600 select-none ${className}`}>
      <span className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mr-1.5 hidden sm:inline">
        Định dạng:
      </span>

      <button
        type="button"
        onClick={() => handleFormat('bold')}
        title="In đậm (**văn bản**)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer font-bold"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleFormat('italic')}
        title="In nghiêng (*văn bản*)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleFormat('heading')}
        title="Tiêu đề đoạn (### Tiêu đề)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <Heading2 className="w-3.5 h-3.5" />
      </button>

      <div className="w-[1px] h-4 bg-ink-200/80 mx-1" />

      <button
        type="button"
        onClick={() => handleFormat('quote')}
        title="Khối trích dẫn (> Trích dẫn)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleFormat('list')}
        title="Gạch đầu dòng (- Mục)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <List className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleFormat('code')}
        title="Đoạn mã (`code`)"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <Code className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => handleFormat('link')}
        title="Chèn liên kết ([tiêu đề](url))"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#FFFDF8] hover:text-clay-700 hover:shadow-xs text-ink-700 transition-all cursor-pointer"
      >
        <LinkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

/**
 * Trình phân tích & hiển thị nội dung bài viết phong phú Markdown + @mention
 */
export const RichPostContent = ({ content, followingUsers = [], onUserClick = null, className = '' }) => {
  if (!content) return null;

  // Tách dòng nội dung
  const lines = String(content).split('\n');

  // Phân tích các khối dòng (heading, quote, list, paragraph)
  return (
    <div className={`space-y-1.5 text-xs sm:text-[13px] leading-relaxed break-words text-[#3B332A] ${className}`}>
      {lines.map((rawLine, lineIdx) => {
        const line = rawLine.trimEnd();

        // 1. Dòng trống
        if (!line.trim()) {
          return <div key={lineIdx} className="h-2" />;
        }

        // 2. Tiêu đề: ### hoặc ## hoặc #
        if (line.startsWith('### ')) {
          return (
            <h4 key={lineIdx} className="font-display font-bold text-sm sm:text-[15px] text-ink-900 mt-2 mb-1">
              {renderInlineMarkdown(line.slice(4), followingUsers, onUserClick)}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={lineIdx} className="font-display font-bold text-base text-ink-900 mt-2.5 mb-1">
              {renderInlineMarkdown(line.slice(3), followingUsers, onUserClick)}
            </h3>
          );
        }
        if (line.startsWith('# ')) {
          return (
            <h2 key={lineIdx} className="font-display font-black text-lg text-ink-900 mt-3 mb-1">
              {renderInlineMarkdown(line.slice(2), followingUsers, onUserClick)}
            </h2>
          );
        }

        // 3. Khối trích dẫn: >
        if (line.startsWith('> ') || line.startsWith('>')) {
          const quoteText = line.replace(/^>\s?/, '');
          return (
            <blockquote
              key={lineIdx}
              className="border-l-3 border-clay-500 pl-3 py-1 my-1 bg-clay-50/60 rounded-r text-ink-700 italic font-medium"
            >
              {renderInlineMarkdown(quoteText, followingUsers, onUserClick)}
            </blockquote>
          );
        }

        // 4. Danh sách gạch đầu dòng: - hoặc *
        if (line.startsWith('- ') || line.startsWith('* ')) {
          const itemText = line.slice(2);
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1.5 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-clay-600 mt-1.5 shrink-0" />
              <div className="flex-1 min-w-0">
                {renderInlineMarkdown(itemText, followingUsers, onUserClick)}
              </div>
            </div>
          );
        }

        // 5. Đoạn văn thường
        return (
          <p key={lineIdx}>
            {renderInlineMarkdown(line, followingUsers, onUserClick)}
          </p>
        );
      })}
    </div>
  );
};

/**
 * Phân tích cú pháp inline markdown (In đậm, In nghiêng, Link, Code, Mention)
 */
function renderInlineMarkdown(text, followingUsers, onUserClick) {
  if (!text) return null;

  // Biểu thức regex tìm token: Bold (**...**), Italic (*...*), Code (`...`), Link ([...](...))
  const tokenRegex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const tokens = text.split(tokenRegex);

  return tokens.map((token, idx) => {
    if (!token) return null;

    // 1. In đậm: **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      const inner = token.slice(2, -2);
      return (
        <strong key={idx} className="font-bold text-ink-950">
          {renderTextWithMentions(inner, followingUsers, onUserClick)}
        </strong>
      );
    }

    // 2. In nghiêng: *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      const inner = token.slice(1, -1);
      return (
        <em key={idx} className="italic text-ink-900">
          {renderTextWithMentions(inner, followingUsers, onUserClick)}
        </em>
      );
    }

    // 3. Code: `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      const inner = token.slice(1, -1);
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 mx-0.5 rounded-[4px] bg-[#EDE5D8] text-clay-700 font-mono text-[11px] font-semibold border border-ink-200/60"
        >
          {inner}
        </code>
      );
    }

    // 4. Link: [title](url)
    const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const safeHref = href.startsWith('http://') || href.startsWith('https://') ? href : `https://${href}`;
      return (
        <a
          key={idx}
          href={safeHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 underline font-semibold hover:text-sky-700 break-all inline-flex items-center gap-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{label}</span>
        </a>
      );
    }

    // 5. Text thường kèm @mention
    return <React.Fragment key={idx}>{renderTextWithMentions(token, followingUsers, onUserClick)}</React.Fragment>;
  });
}
