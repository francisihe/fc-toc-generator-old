import { useState, useEffect } from 'react';

interface TocEntry {
    text: string;
    link: string;
    level: number;
}

const Preview = ({ entries }: { entries: TocEntry[] }) => {
    if (!entries.length) return null;

    const previewText = [
        'What we\'ll cover:',
        ...entries.map(entry => {
            const indent = '   '.repeat(entry.level - 1);
            return `${indent}* ${entry.text}`;
        })
    ].join('\n');

    return (
        <div style={{
            fontFamily: 'system-ui, sans-serif',
            lineHeight: '1.6',
            color: '#000'
        }}>
            <p style={{ fontWeight: 500, marginBottom: '12px' }}>What we'll cover:</p>
            <div style={{ paddingLeft: '8px' }}>
                {entries.map((entry, index) => (
                    <div
                        key={index}
                        style={{
                            paddingLeft: (entry.level - 1) * 20 + 'px',
                            marginBottom: '4px'
                        }}
                    >
                        <span style={{ marginRight: '8px' }}>
                            {entry.level === 1 ? '•' : '○'}
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
    const [markdownOutput, setMarkdownOutput] = useState('');
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

        // Numbered sections with various formats
        if (/^(\d+\.)+\s+[A-Z]/.test(trimmedLine)) {
            return (trimmedLine.match(/\./g) || []).length;
        }
        if (/^[A-Z]\d+\.\s+[A-Z]/.test(trimmedLine)) return 2;
        if (/^[IVXivx]+\.\s+[A-Z]/.test(trimmedLine)) return 1;

        // Common subsection patterns
        if (/^(Step|Phase|Stage)\s+\d+:/i.test(trimmedLine)) return 2;

        // Text-based detection
        if (/^[A-Z][^.!?]+$/.test(trimmedLine)) {
            if (trimmedLine.length < 50) return 1;
            if (trimmedLine.length < 80) return 2;
        }

        return 0;
    };

    const parseMarkdownToEntries = (markdown: string) => {
        const lines = markdown.split('\n');
        const entries: TocEntry[] = [];

        lines.forEach(line => {
            const match = line.match(/^(\s*)\* \[(.*?)\]\((.*?)\)/);
            if (match) {
                const level = Math.floor(match[1].length / 3) + 1;
                const text = match[2];
                const link = match[3].replace(/^#/, '');
                entries.push({ text, link, level });
            }
        });

        return entries;
    };

    const generateTOC = (content: string) => {
        const lines = content.split('\n');
        const toc: TocEntry[] = [];

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

        // Generate markdown TOC
        const markdown = [
            'What we\'ll cover:',
            ...toc.map(entry => {
                const indent = '   '.repeat(entry.level - 1);
                return `${indent}* [${entry.text}](#${entry.link})`;
            })
        ].join('\n');

        setTocEntries(toc);
        setMarkdownOutput(markdown);
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
                    <div style={{
                        marginTop: '30px',
                        padding: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                    }}>
                        <h3>Preview</h3>
                        <Preview entries={tocEntries} />
                    </div>

                    <div style={{ marginTop: '30px' }}>
                        <h3>Edit Markdown</h3>
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
                </>
            )}

            {
                markdownOutput && (
                    <div style={{ marginTop: '30px' }}>
                        <h3>Output</h3>
                        <textarea
                            style={{
                                width: '100%',
                                height: '200px',
                                marginBottom: '10px',
                                padding: '10px',
                                fontFamily: 'monospace'
                            }}
                            value={markdownOutput}
                            readOnly
                        />
                        <button
                            onClick={() => copyToClipboard(markdownOutput)}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Copy to Clipboard
                        </button>
                    </div>
                )
            }
        </div>
    );
}

export default App;