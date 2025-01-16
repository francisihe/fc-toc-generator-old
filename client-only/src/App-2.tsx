import { useState } from 'react';

function App() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');

    const generateTOC = (content: string) => {
        // Split content into lines
        const lines = content.split('\n');
        const toc: { text: string; link: string }[] = [];

        lines.forEach(line => {
            const trimmedLine = line.trim();
            // Looking for lines that might be headers (checking for capitalization patterns
            // or if line is shorter than typical paragraphs)
            if (
                trimmedLine &&
                trimmedLine.length < 100 &&
                !trimmedLine.endsWith('.') &&
                /^[A-Z]/.test(trimmedLine) // Starts with capital letter
            ) {
                const text = trimmedLine;
                // Create GitHub-style anchor links
                const link = text
                    .toLowerCase()
                    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
                    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

                toc.push({ text, link });
            }
        });

        // Generate markdown TOC
        const tocMarkdown = toc
            .map(entry => `- [${entry.text}](#${entry.link})`)
            .join('\n');

        setOutput(tocMarkdown);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(output);
            alert('Copied to clipboard!');
        } catch (err) {
            console.log(err);
            alert('Failed to copy to clipboard');
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
            <h1>Table of Contents Generator</h1>

            <div>
                <textarea
                    style={{
                        width: '100%',
                        height: '200px',
                        marginBottom: '20px',
                        padding: '10px'
                    }}
                    placeholder="Paste your content here..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            <div>
                <button
                    onClick={() => generateTOC(input)}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px'
                    }}
                >
                    Generate TOC
                </button>
            </div>

            {output && (
                <div style={{ marginTop: '20px' }}>
                    <textarea
                        style={{
                            width: '100%',
                            height: '200px',
                            marginBottom: '10px',
                            padding: '10px'
                        }}
                        value={output}
                        readOnly
                    />
                    <button
                        onClick={copyToClipboard}
                        style={{ padding: '10px 20px' }}
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
}

export default App;