import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  AlignLeft,
  Code2,
  Maximize2,
  Minimize2,
  Terminal,
  Type
} from 'lucide-react';
import { useI18n } from '../i18n';

interface SqlCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute?: (sql?: string) => void;
  isExecuting?: boolean;
  minHeight?: string;
  maxHeight?: string;
  placeholder?: string;
  showLineNumbers?: boolean;
  showSnippetBar?: boolean;
  showStatusBar?: boolean;
  autoFocus?: boolean;
  className?: string;
}

// Comprehensive SQLite Keywords List
const SQL_KEYWORDS = new Set([
  'ABORT', 'ACTION', 'ADD', 'AFTER', 'ALL', 'ALTER', 'ALWAYS', 'ANALYZE', 'AND', 'AS', 'ASC', 'ATTACH',
  'AUTOINCREMENT', 'BEFORE', 'BEGIN', 'BETWEEN', 'BY', 'CASCADE', 'CASE', 'CAST', 'CHECK', 'COLLATE',
  'COLUMN', 'COMMIT', 'CONFLICT', 'CONSTRAINT', 'CREATE', 'CROSS', 'CURRENT', 'CURRENT_DATE',
  'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATABASE', 'DEFAULT', 'DEFERRABLE', 'DEFERRED', 'DELETE',
  'DESC', 'DETACH', 'DISTINCT', 'DO', 'DROP', 'EACH', 'ELSE', 'END', 'ESCAPE', 'EXCEPT', 'EXCLUSIVE',
  'EXISTS', 'EXPLAIN', 'FAIL', 'FILTER', 'FIRST', 'FOLLOWING', 'FOR', 'FOREIGN', 'FROM', 'FULL',
  'GENERATED', 'GLOB', 'GROUP', 'GROUPS', 'HAVING', 'IF', 'IGNORE', 'IMMEDIATE', 'IN', 'INDEX',
  'INDEXED', 'INITIALLY', 'INNER', 'INSERT', 'INSTEAD', 'INTERSECT', 'INTO', 'IS', 'ISNULL', 'JOIN',
  'KEY', 'LAST', 'LEFT', 'LIKE', 'LIMIT', 'MATCH', 'MATERIALIZED', 'NATURAL', 'NO', 'NOT', 'NOTHING',
  'NOTNULL', 'NULL', 'NULLS', 'OF', 'OFFSET', 'ON', 'OR', 'ORDER', 'OTHERS', 'OUTER', 'OVER', 'PARTITION',
  'PLAN', 'PRAGMA', 'PRECEDING', 'PRIMARY', 'QUERY', 'RAISE', 'RANGE', 'RECURSIVE', 'REFERENCES',
  'REGEXP', 'REINDEX', 'RELEASE', 'RENAME', 'REPLACE', 'RESTRICT', 'RETURNING', 'RIGHT', 'ROLLBACK',
  'ROW', 'ROWS', 'SAVEPOINT', 'SELECT', 'SET', 'STORED', 'STRICT', 'TABLE', 'TEMP', 'TEMPORARY',
  'THEN', 'TIES', 'TO', 'TRANSACTION', 'TRIGGER', 'UNBOUNDED', 'UNION', 'UNIQUE', 'UPDATE', 'USING',
  'VACUUM', 'VALUES', 'VIEW', 'VIRTUAL', 'WHEN', 'WHERE', 'WINDOW', 'WITH', 'WITHOUT'
]);

// SQLite Built-in Functions
const SQL_FUNCTIONS = new Set([
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'TOTAL', 'ROUND', 'ABS', 'COALESCE', 'NULLIF', 'IFNULL',
  'LENGTH', 'LOWER', 'UPPER', 'SUBSTR', 'SUBSTRING', 'TRIM', 'RTRIM', 'LTRIM', 'REPLACE', 'INSTR',
  'PRINTF', 'FORMAT', 'CHAR', 'UNICODE', 'QUOTE', 'HEX', 'UNHEX', 'RANDOM', 'RANDOMBLOB', 'ZEROBLOB',
  'TYPEOF', 'LAST_INSERT_ROWID', 'CHANGES', 'TOTAL_CHANGES', 'SOUNDEX', 'LIKELIHOOD', 'LIKELY', 'UNLIKELY',
  'JSON', 'JSON_ARRAY', 'JSON_ARRAY_LENGTH', 'JSON_EXTRACT', 'JSON_INSERT', 'JSON_OBJECT', 'JSON_PATCH',
  'JSON_REMOVE', 'JSON_REPLACE', 'JSON_SET', 'JSON_TYPE', 'JSON_VALID', 'JSON_QUOTE',
  'JSON_GROUP_ARRAY', 'JSON_GROUP_OBJECT', 'JSON_EACH', 'JSON_TREE',
  'DATE', 'TIME', 'DATETIME', 'JULIANDAY', 'STRFTIME', 'UNIXEPOCH', 'TIMEDELTA'
]);

// Data Types
const SQL_DATATYPES = new Set([
  'TEXT', 'INTEGER', 'INT', 'BIGINT', 'SMALLINT', 'TINYINT', 'MEDIUMINT', 'REAL', 'DOUBLE', 'FLOAT',
  'BLOB', 'BOOLEAN', 'BOOL', 'NUMERIC', 'DECIMAL', 'VARCHAR', 'CHAR', 'CLOB', 'DATETIME', 'TIMESTAMP',
  'DATE', 'TIME', 'ANY', 'JSON'
]);

// SQLite Quick Snippets
const SQL_SNIPPETS = [
  { label: 'SELECT *', insert: 'SELECT * FROM ' },
  { label: 'WHERE', insert: ' WHERE ' },
  { label: 'ORDER BY DESC', insert: ' ORDER BY created_at DESC' },
  { label: 'GROUP BY', insert: ' GROUP BY ' },
  { label: 'LEFT JOIN', insert: ' LEFT JOIN table_name ON table_name.id = ' },
  { label: 'LIMIT 25', insert: ' LIMIT 25;' },
  { label: 'COUNT(*)', insert: 'COUNT(*) AS total_count' },
  { label: 'EXPLAIN PLAN', insert: 'EXPLAIN QUERY PLAN ' },
  { label: 'PRAGMA table_info', insert: 'PRAGMA table_info(arena_test_runs);' },
];

// High-Contrast Dark Theme Syntax Palette
const COLOR_KEYWORD = '#fde047'; // Bright Yellow (High contrast, bold)
const COLOR_FUNCTION = '#38bdf8'; // Electric Sky Blue (Bold)
const COLOR_STRING = '#67e8f9'; // Light Cyan (Crisp, clean)
const COLOR_NUMBER = '#fb923c'; // Vibrant Orange / Amber
const COLOR_DATATYPE = '#f472b6'; // Vibrant Pink / Magenta
const COLOR_COMMENT = '#94a3b8'; // Readable Slate Gray (Italic)
const COLOR_OPERATOR = '#ffffff'; // Crisp White (Bold)
const COLOR_PUNCTUATION = '#f1f5f9'; // Light Silver / White
const COLOR_DEFAULT = '#f8fafc'; // Clean Off-White (Identifiers & Default text)

/**
 * High-performance SQL syntax highlighter parser that generates HTML spans with explicit inline style colors
 */
function highlightSql(code: string): string {
  if (!code) return '';

  let html = '';
  let i = 0;
  const len = code.length;

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  while (i < len) {
    const char = code[i];

    // Single-line comment (-- ...)
    if (char === '-' && code[i + 1] === '-') {
      let comment = '';
      while (i < len && code[i] !== '\n') {
        comment += code[i];
        i++;
      }
      html += `<span style="color:${COLOR_COMMENT};font-style:italic;">${escapeHtml(comment)}</span>`;
      continue;
    }

    // Multi-line comment (/* ... */)
    if (char === '/' && code[i + 1] === '*') {
      let comment = '/*';
      i += 2;
      while (i < len && !(code[i] === '*' && code[i + 1] === '/')) {
        comment += code[i];
        i++;
      }
      if (i < len) {
        comment += '*/';
        i += 2;
      }
      html += `<span style="color:${COLOR_COMMENT};font-style:italic;">${escapeHtml(comment)}</span>`;
      continue;
    }

    // String literal (single quotes '...')
    if (char === "'") {
      let str = "'";
      i++;
      while (i < len) {
        if (code[i] === "'") {
          str += "'";
          i++;
          if (code[i] === "'") {
            str += "'";
            i++;
            continue;
          }
          break;
        }
        str += code[i];
        i++;
      }
      html += `<span style="color:${COLOR_STRING};font-weight:500;">${escapeHtml(str)}</span>`;
      continue;
    }

    // Double-quoted identifier or backtick ("..." or `...`)
    if (char === '"' || char === '`') {
      const quoteType = char;
      let str = quoteType;
      i++;
      while (i < len && code[i] !== quoteType) {
        str += code[i];
        i++;
      }
      if (i < len) {
        str += quoteType;
        i++;
      }
      html += `<span style="color:${COLOR_STRING};font-weight:500;">${escapeHtml(str)}</span>`;
      continue;
    }

    // Numbers (integers, floats, hex)
    if (/\d/.test(char) || (char === '.' && /\d/.test(code[i + 1] || ''))) {
      let num = '';
      if (char === '0' && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        num += code[i] + code[i + 1];
        i += 2;
        while (i < len && /[0-9a-fA-F]/.test(code[i])) {
          num += code[i];
          i++;
        }
      } else {
        while (i < len && /[0-9\._eE\+\-]/.test(code[i])) {
          num += code[i];
          i++;
        }
      }
      html += `<span style="color:${COLOR_NUMBER};font-weight:600;">${escapeHtml(num)}</span>`;
      continue;
    }

    // Identifiers, Keywords, Functions, Data types
    if (/[a-zA-Z_]/.test(char)) {
      let word = '';
      while (i < len && /[a-zA-Z0-9_]/.test(code[i])) {
        word += code[i];
        i++;
      }

      const upperWord = word.toUpperCase();

      let nextNonSpaceIndex = i;
      while (nextNonSpaceIndex < len && /\s/.test(code[nextNonSpaceIndex])) {
        if (code[nextNonSpaceIndex] === '\n') break;
        nextNonSpaceIndex++;
      }
      const isFunctionCall = code[nextNonSpaceIndex] === '(' && SQL_FUNCTIONS.has(upperWord);

      if (isFunctionCall) {
        html += `<span style="color:${COLOR_FUNCTION};font-weight:700;">${escapeHtml(word)}</span>`;
      } else if (SQL_KEYWORDS.has(upperWord)) {
        html += `<span style="color:${COLOR_KEYWORD};font-weight:700;">${escapeHtml(word)}</span>`;
      } else if (SQL_DATATYPES.has(upperWord)) {
        html += `<span style="color:${COLOR_DATATYPE};font-weight:600;">${escapeHtml(word)}</span>`;
      } else {
        html += `<span style="color:${COLOR_DEFAULT};">${escapeHtml(word)}</span>`;
      }
      continue;
    }

    // Operators & Punctuation
    if (/[=<>!+\-*/%|&~^]/.test(char)) {
      let op = char;
      i++;
      while (i < len && /[=<>!+\-*/%|&~^]/.test(code[i])) {
        op += code[i];
        i++;
      }
      html += `<span style="color:${COLOR_OPERATOR};font-weight:700;">${escapeHtml(op)}</span>`;
      continue;
    }

    if (/[(),;.]/.test(char)) {
      html += `<span style="color:${COLOR_PUNCTUATION};font-weight:600;">${escapeHtml(char)}</span>`;
      i++;
      continue;
    }

    // Whitespace and other characters
    html += escapeHtml(char);
    i++;
  }

  return html;
}

/**
 * Lightweight SQL Formatter
 */
export function formatSql(rawSql: string): string {
  if (!rawSql || !rawSql.trim()) return '';

  let sql = rawSql.trim();

  const MAJOR_CLAUSES = [
    'SELECT',
    'FROM',
    'WHERE',
    'GROUP BY',
    'HAVING',
    'ORDER BY',
    'LIMIT',
    'OFFSET',
    'LEFT JOIN',
    'RIGHT JOIN',
    'INNER JOIN',
    'FULL JOIN',
    'CROSS JOIN',
    'JOIN',
    'ON',
    'UNION ALL',
    'UNION',
    'INSERT INTO',
    'VALUES',
    'UPDATE',
    'SET',
    'DELETE FROM',
    'CREATE TABLE IF NOT EXISTS',
    'CREATE TABLE',
    'ALTER TABLE',
    'DROP TABLE IF EXISTS',
    'DROP TABLE',
    'BEGIN TRANSACTION',
    'COMMIT',
    'ROLLBACK',
  ];

  MAJOR_CLAUSES.forEach((clause) => {
    const regex = new RegExp(`\\b${clause.replace(/ /g, '\\s+')}\\b`, 'gi');
    sql = sql.replace(regex, `\n${clause} `);
  });

  const lines = sql
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let formatted = '';
  let indentLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      line.startsWith('FROM') ||
      line.startsWith('WHERE') ||
      line.startsWith('GROUP BY') ||
      line.startsWith('HAVING') ||
      line.startsWith('ORDER BY') ||
      line.startsWith('LIMIT') ||
      line.startsWith('SET') ||
      line.startsWith('VALUES') ||
      line.startsWith('LEFT JOIN') ||
      line.startsWith('JOIN')
    ) {
      formatted += line + '\n';
    } else if (line.startsWith('(')) {
      formatted += line + '\n';
      indentLevel++;
    } else if (line.endsWith(');') || line === ')') {
      indentLevel = Math.max(0, indentLevel - 1);
      formatted += '  '.repeat(indentLevel) + line + '\n';
    } else {
      formatted += line + '\n';
    }
  }

  return formatted.trim();
}

export const SqlCodeEditor: React.FC<SqlCodeEditorProps> = ({
  value,
  onChange,
  onExecute,
  isExecuting = false,
  minHeight = '150px',
  maxHeight = '320px',
  placeholder,
  showLineNumbers = true,
  showSnippetBar = true,
  showStatusBar = true,
  autoFocus = false,
  className = '',
}) => {
  const { t } = useI18n();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Editor states
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isHighlightEnabled, setIsHighlightEnabled] = useState<boolean>(true);

  // Lines calculation
  const lines = useMemo(() => {
    return (value || '').split('\n');
  }, [value]);

  const lineCount = lines.length;

  // Sync scroll from textarea to pre and line numbers gutter
  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (preRef.current) {
      preRef.current.scrollTop = scrollTop;
      preRef.current.scrollLeft = scrollLeft;
    }
    if (gutterRef.current) {
      gutterRef.current.scrollTop = scrollTop;
    }
  };

  // Track cursor line & column
  const updateCursorPosition = () => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart;
    const textBefore = value.substring(0, pos);
    const splitLines = textBefore.split('\n');
    const line = splitLines.length;
    const col = splitLines[splitLines.length - 1].length + 1;
    setCursorPos({ line, col });
  };

  // Keyboard navigation & Shortcuts (Tab, Auto-Indent, Run)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. Run Query on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (onExecute) {
        onExecute(value);
      }
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 2. Tab Key (2-space indent or unindent)
    if (e.key === 'Tab') {
      e.preventDefault();
      const tabSpaces = '  ';

      if (e.shiftKey) {
        // Shift+Tab: Unindent
        const beforeCursor = value.substring(0, start);
        const lastNewline = beforeCursor.lastIndexOf('\n');
        const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;
        const currentLine = value.substring(lineStart, end);

        if (currentLine.startsWith('  ')) {
          const nextVal = value.substring(0, lineStart) + value.substring(lineStart + 2);
          onChange(nextVal);
          setTimeout(() => {
            textarea.selectionStart = Math.max(lineStart, start - 2);
            textarea.selectionEnd = Math.max(lineStart, end - 2);
            updateCursorPosition();
          }, 0);
        }
      } else {
        // Tab: Insert 2 spaces
        const nextVal = value.substring(0, start) + tabSpaces + value.substring(end);
        onChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          updateCursorPosition();
        }, 0);
      }
      return;
    }

    // 3. Auto-Indent on Enter
    if (e.key === 'Enter') {
      const beforeCursor = value.substring(0, start);
      const lastNewline = beforeCursor.lastIndexOf('\n');
      const currentLine = lastNewline === -1 ? beforeCursor : beforeCursor.substring(lastNewline + 1);
      const matchIndent = currentLine.match(/^\s+/);
      let indent = matchIndent ? matchIndent[0] : '';

      if (currentLine.trim().endsWith('(')) {
        indent += '  ';
      }

      if (indent.length > 0) {
        e.preventDefault();
        const nextVal = value.substring(0, start) + '\n' + indent + value.substring(end);
        onChange(nextVal);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
          updateCursorPosition();
        }, 0);
      }
    }
  };

  // Format SQL Query Handler
  const handleFormatQuery = () => {
    const formatted = formatSql(value);
    if (formatted && formatted !== value) {
      onChange(formatted);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Insert Snippet at Caret
  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      onChange(value + (value.endsWith(' ') || value.endsWith('\n') ? '' : ' ') + snippet);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextVal = value.substring(0, start) + snippet + value.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + snippet.length;
      updateCursorPosition();
    }, 0);
  };

  // Copy SQL to Clipboard
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Generate Syntax Highlighted HTML
  const highlightedCodeHtml = useMemo(() => {
    if (!value) {
      return '';
    }
    return highlightSql(value) + '\n';
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  // Unified typography CSS to guarantee 100% pixel-perfect caret & text alignment
  const unifiedTypographyStyle: React.CSSProperties = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: '13px',
    lineHeight: '22px',
    letterSpacing: '0px',
    tabSize: 2,
    padding: '12px 14px',
    margin: 0,
    border: 'none',
    outline: 'none',
    whiteSpace: 'pre',
    wordBreak: 'normal',
    overflowWrap: 'normal',
    boxSizing: 'border-box',
  };

  return (
    <div
      className={`rounded-2xl border border-zinc-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden shadow-xs transition-all flex flex-col ${
        isExpanded ? 'fixed inset-4 z-50 shadow-2xl bg-white dark:bg-neutral-950 flex flex-col' : 'w-full'
      } ${className}`}
    >
      {/* Editor Header Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-200 dark:border-neutral-800 bg-zinc-50/80 dark:bg-neutral-900/60 backdrop-blur-sm text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 dark:bg-black text-emerald-400 flex items-center justify-center border border-zinc-700/50">
            <Code2 size={13} />
          </div>
          <span className="font-bold text-zinc-800 dark:text-neutral-200">
            {t('sqlite.editorTitle')}
          </span>

          {/* Syntax Highlighter Toggle */}
          <button
            type="button"
            onClick={() => setIsHighlightEnabled(!isHighlightEnabled)}
            className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all cursor-pointer ${
              isHighlightEnabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-zinc-200 dark:bg-neutral-800 text-zinc-600 dark:text-neutral-400 border-zinc-300 dark:border-neutral-700'
            }`}
            title="Toggle Syntax Highlighting"
          >
            <Sparkles size={10} />
            <span>{isHighlightEnabled ? 'Highlight: ON' : 'Highlight: OFF'}</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Format SQL Button */}
          <button
            type="button"
            onClick={handleFormatQuery}
            title={t('sqlite.formatSqlTooltip')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-700 dark:text-neutral-300 transition-colors border border-zinc-200 dark:border-neutral-700 cursor-pointer text-[11px]"
          >
            <AlignLeft size={12} />
            <span>{t('sqlite.formatSql')}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy SQL"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 transition-colors border border-zinc-200 dark:border-neutral-700 cursor-pointer text-[11px]"
          >
            {isCopied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{isCopied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Expand / Minimize Toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Minimize' : 'Full-screen'}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-neutral-800 hover:bg-zinc-200 dark:hover:bg-neutral-700 text-zinc-700 dark:text-neutral-300 transition-colors border border-zinc-200 dark:border-neutral-700 cursor-pointer"
          >
            {isExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Quick Snippet Chips Bar */}
      {showSnippetBar && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-200 dark:border-neutral-800/80 bg-zinc-100/60 dark:bg-neutral-900/30 overflow-x-auto text-[10px] font-mono no-scrollbar">
          <span className="text-zinc-400 whitespace-nowrap flex items-center gap-1 pr-1 font-semibold">
            <Sparkles size={11} className="text-amber-500" />
            <span>Snippets:</span>
          </span>
          {SQL_SNIPPETS.map((snippet) => (
            <button
              key={snippet.label}
              type="button"
              onClick={() => handleInsertSnippet(snippet.insert)}
              className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 hover:bg-emerald-500/15 hover:text-emerald-600 dark:hover:text-emerald-400 text-zinc-700 dark:text-neutral-300 border border-zinc-200 dark:border-neutral-700/80 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
            >
              {snippet.label}
            </button>
          ))}
        </div>
      )}

      {/* Editor Body: Line Numbers Gutter + Code Area */}
      <div
        className="relative flex w-full bg-zinc-950 font-mono text-xs overflow-hidden"
        style={{
          height: isExpanded ? 'calc(100vh - 160px)' : (minHeight || '180px'),
          minHeight: isExpanded ? 'calc(100vh - 160px)' : (minHeight || '180px'),
          maxHeight: isExpanded ? 'calc(100vh - 160px)' : (maxHeight || '360px'),
        }}
      >
        {/* Line Numbers Gutter */}
        {showLineNumbers && (
          <div
            ref={gutterRef}
            aria-hidden="true"
            className="w-10 sm:w-12 bg-zinc-950/90 text-zinc-600 dark:text-neutral-600 border-r border-zinc-800/80 select-none text-right pr-2.5 overflow-hidden flex-shrink-0 text-xs font-mono"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '13px',
              lineHeight: '22px',
              paddingTop: '12px',
              paddingBottom: '12px',
            }}
          >
            {Array.from({ length: Math.max(lineCount, 1) }).map((_, idx) => {
              const lineNum = idx + 1;
              const isCurrentLine = cursorPos.line === lineNum;
              return (
                <div
                  key={lineNum}
                  className={`${
                    isCurrentLine
                      ? 'text-emerald-400 font-bold bg-emerald-500/10 -mr-2.5 pr-2.5 rounded-l'
                      : ''
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        )}

        {/* Text Area & Syntax Highlight Backing Container */}
        <div className="relative flex-1 w-full h-full min-h-full overflow-hidden bg-zinc-950">
          {/* Backing Syntax Highlighted Layer (<pre><code>) - Rendered only if highlight enabled and value exists */}
          {isHighlightEnabled && value && (
            <pre
              ref={preRef}
              aria-hidden="true"
              style={{
                ...unifiedTypographyStyle,
                color: COLOR_DEFAULT,
                backgroundColor: 'transparent',
              }}
              className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0 select-none"
              dangerouslySetInnerHTML={{ __html: highlightedCodeHtml }}
            />
          )}

          {/* Interactive Foreground Textarea */}
          <textarea
            ref={textareaRef}
            id="sqlite-sql-code-editor-input"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              updateCursorPosition();
            }}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onSelect={updateCursorPosition}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t('sqlite.editorPlaceholder')}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            style={{
              ...unifiedTypographyStyle,
              color: !value ? '#94a3b8' : (isHighlightEnabled ? 'transparent' : '#f8fafc'),
              WebkitTextFillColor: !value ? '#94a3b8' : (isHighlightEnabled ? 'transparent' : '#f8fafc'),
              caretColor: '#38bdf8',
              backgroundColor: 'transparent',
            }}
            className="absolute inset-0 w-full h-full resize-none focus:outline-none z-10 selection:bg-cyan-500/30 selection:text-transparent overflow-auto"
          />
        </div>
      </div>

      {/* Editor Footer Status Bar */}
      {showStatusBar && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-zinc-200 dark:border-neutral-800 bg-zinc-50 dark:bg-neutral-900 text-[11px] font-mono text-zinc-500 dark:text-neutral-400 select-none">
          <div className="flex items-center gap-3">
            <span className="text-zinc-700 dark:text-neutral-300 font-semibold">
              Ln {cursorPos.line}, Col {cursorPos.col}
            </span>
            <span className="hidden sm:inline-block text-zinc-400">|</span>
            <span className="hidden sm:inline-block">
              {lineCount} {lineCount === 1 ? 'line' : 'lines'}
            </span>
            <span className="hidden md:inline-block text-zinc-400">|</span>
            <span className="hidden md:inline-block">{value.length} chars</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:inline-block text-zinc-400">
              {t('sqlite.editorTips')}
            </span>

            {onExecute && (
              <button
                type="button"
                onClick={() => onExecute(value)}
                disabled={isExecuting || !value.trim()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs transition-all shadow-xs cursor-pointer"
              >
                <Play size={11} className={isExecuting ? 'animate-spin' : ''} />
                <span>{isExecuting ? 'Executing...' : t('sqlite.runQuery')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
