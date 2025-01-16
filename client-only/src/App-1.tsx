import { useState } from 'react';
import './App.css'

type TocItem = {
  level: number;
  text: string;
  id: string;
};

function App() {
  const [inputContent, setInputContent] = useState<string>('');
  const [toc, setToc] = useState<TocItem[]>([]);

  const parseHeadings = (): void => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(inputContent, 'text/html');

    const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const tocData: TocItem[] = headings.map((heading) => ({
      level: parseInt(heading.tagName[1]),
      text: heading.textContent || '',
      id: heading.id || (heading.textContent || '').toLowerCase().replace(/\s+/g, '-')
    }));

    setToc(tocData);
  };

  const generateMarkdown = (): string => {
    return toc
      .map((item) => `${'  '.repeat(item.level - 1)}- [${item.text}](#${item.id})`)
      .join('\n');
  };

  const copyToClipboard = (): void => {
    const markdown = generateMarkdown();
    navigator.clipboard.writeText(markdown).then(() => {
      alert('Markdown copied to clipboard!');
    });
  };

  const downloadMarkdown = (): void => {
    const markdown = generateMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toc.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">TOC Generator</h1>
      <textarea
        className="w-full p-4 h-64 border rounded mb-4 focus:outline-none focus:ring-2"
        placeholder="Paste your HTML or Markdown content here..."
        value={inputContent}
        onChange={(e) => setInputContent(e.target.value)}
      ></textarea>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded mr-2 hover:bg-blue-600"
        onClick={parseHeadings}
      >
        Generate TOC
      </button>

      {toc.length > 0 && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Generated TOC</h2>
          <ul className="list-disc pl-6">
            {toc.map((item, index) => (
              <li key={index} className={`ml-${(item.level - 1) * 4}`}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600"
              onClick={copyToClipboard}
            >
              Copy Markdown
            </button>
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              onClick={downloadMarkdown}
            >
              Download Markdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App