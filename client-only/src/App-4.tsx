import { useState, useEffect } from 'react';

interface TocEntry {
  text: string;
  link: string;
  level: number;
  index?: number;
}

const Preview = ({ entries }: { entries: TocEntry[] }) => {
  if (!entries.length) return null;

  // Calculate indices for top-level entries
  let currentIndex = 1;
  const entriesWithIndices = entries.map(entry => ({
    ...entry,
    index: entry.level === 1 ? currentIndex++ : undefined
  }));

  const previewText = [
    'Table of Contents:',
    ...entriesWithIndices.map(entry => {
      const indent = '   '.repeat(entry.level - 1);
      const prefix = entry.level === 1 ? `${entry.index}. ` : 
                    entry.level === 2 ? '* ' : '○ ';
      return `${indent}${prefix}${entry.text}`;
    })
  ].join('\n');

  return (
    <div style={{ 
      fontFamily: 'system-ui, sans-serif', 
      lineHeight: '1.6',
      color: '#000'
    }}>
      <p style={{ fontWeight: 600, marginBottom: '12px' }}>Table of Contents:</p>
      <div style={{ paddingLeft: '8px' }}>
        {entriesWithIndices.map((entry, idx) => (
          <div 
            key={idx}
            style={{ 
              paddingLeft: (entry.level - 1) * 20 + 'px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'baseline'
            }}
          >
            <span style={{ 
              marginRight: '8px',
              minWidth: entry.level === 1 ? '20px' : '12px'
            }}>
              {entry.level === 1 ? `${entry.index}.` :
               entry.level === 2 ? '•' : '○'}
            </span>
            <a 
              href={`#${entry.link}`}
              style={{
                color: '#000',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
              }}
            >
              {entry.text}
            </a>
          </div>
        ))}
      </div>
      <button 
        onClick={() => copyToClipboard(previewText)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ddd',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Copy Formatted Text
      </button>
    </div>
  );
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  } catch (err) {
    console.log(err);
    alert('Failed to copy to clipboard');
  }
};

function App() {
  const [input, setInput] = useState('');
  const [tocEntries, setTocEntries] = useState<TocEntry[]>([]);
  const [editableMarkdown, setEditableMarkdown] = useState('');

  const detectHeadingLevel = (line: string): number => {
    const trimmedLine = line.trim();
    
    // Markdown-style headers
    if (/^#+\s+/.test(trimmedLine)) {
      return trimmedLine.match(/^#+/)?.[0].length || 0;
    }
    
    // Common document sections
    if (/^(Chapter|Section|Part)\s+\d+[:.]/i.test(trimmedLine)) return 1;
    if (/^(Introduction|Overview|Conclusion|Summary|Prerequisites|Getting Started|Background|Methodology|Results|Discussion|References|Appendix)$/i.test(trimmedLine)) return 1;
    
    // Numbered sections
    if (/^(\d+\.)+\s+[A-Z]/.test(trimmedLine)) {
      return (trimmedLine.match(/\./g) || []).length;
    }
    
    // Text-based detection
    if (/^[A-Z][^.!?]+$/.test(trimmedLine)) {
      if (trimmedLine.length < 50) return 1;
      if (trimmedLine.length < 80) return 2;
    }
    
    return 0;
  };

  const parseMarkdownToEntries = (markdown: string): TocEntry[] => {
    const lines = markdown.split('\n').filter(line => line.trim());
    const entries: TocEntry[] = [];
    let currentNumber = 1;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine === 'Table of Contents:') return;

      // Match different formats
      const numberMatch = line.match(/^(\d+)\.\s+(.+)$/);
      const bulletMatch = line.match(/^\s*[\*\•]\s+(.+)$/);
      const circleMatch = line.match(/^\s*○\s+(.+)$/);

      if (numberMatch) {
        const text = numberMatch[2];
        entries.push({
          text,
          link: text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          level: 1
        });
      } else if (bulletMatch) {
        const text = bulletMatch[1];
        entries.push({
          text,
          link: text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          level: 2
        });
      } else if (circleMatch) {
        const text = circleMatch[1];
        entries.push({
          text,
          link: text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
          level: 3
        });
      }
    });

    return entries;
  };

  const generateTOC = (content: string) => {
    const lines = content.split('\n');
    const toc: TocEntry[] = [];
    let currentNumber = 1;
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      const level = detectHeadingLevel(trimmedLine);
      
      if (level > 0) {
        const text = trimmedLine
          .replace(/^#+\s+/, '')
          .replace(/^\d+\.\s+/, '')
          .replace(/^[IVXivx]+\.\s+/, '');
        
        const link = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/--+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        toc.push({ text, link, level });
      }
    });
    
    // Generate markdown
    const markdown = [
      'Table of Contents:',
      ...toc.map((entry, index) => {
        const indent = '   '.repeat(entry.level - 1);
        const prefix = entry.level === 1 ? `${index + 1}. ` :
                      entry.level === 2 ? '* ' : '○ ';
        return `${indent}${prefix}${entry.text}`;
      })
    ].join('\n');
    
    setTocEntries(toc);
    setEditableMarkdown(markdown);
  };

  // Update preview when editable markdown changes
  useEffect(() => {
    if (editableMarkdown) {
      const newEntries = parseMarkdownToEntries(editableMarkdown);
      setTocEntries(newEntries);
    }
  }, [editableMarkdown]);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h1>Table of Contents Generator</h1>
      
      <div>
        <h3>Input</h3>
        <textarea
          style={{
            width: '100%',
            height: '200px',
            marginBottom: '20px',
            padding: '10px',
            fontFamily: 'monospace'
          }}
          placeholder="Paste your content here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      
      <button 
        onClick={() => generateTOC(input)}
        style={{
          padding: '10px 20px',
          marginRight: '10px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Generate TOC
      </button>

      {tocEntries.length > 0 && (
        <>
          <div style={{ marginTop: '30px' }}>
            <h3>Edit Table of Contents</h3>
            <textarea
              style={{
                width: '100%',
                height: '200px',
                marginBottom: '10px',
                padding: '10px',
                fontFamily: 'monospace'
              }}
              value={editableMarkdown}
              onChange={(e) => setEditableMarkdown(e.target.value)}
            />
            <button 
              onClick={() => copyToClipboard(editableMarkdown)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Copy Markdown
            </button>
          </div>

          <div style={{ 
            marginTop: '30px',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}>
            <h3>Preview</h3>
            <Preview entries={tocEntries} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;