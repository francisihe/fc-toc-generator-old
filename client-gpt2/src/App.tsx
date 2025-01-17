import { useState } from "react";

const HuggingFaceInference = () => {
  const [inputText, setInputText] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);

  const HUGGING_FACE_API_KEY=''

  const generateText = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/distilbert/distilgpt2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${HUGGING_FACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: inputText }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const result = await response.json();
      setGeneratedText(result[0]?.generated_text || "No text generated");
    } catch (error) {
      console.error("Error generating text:", error);
      setGeneratedText("Failed to generate text.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h1>Text Generation with Hugging Face API</h1>
      <textarea
        // rows="4"
        style={{ width: "100%", marginBottom: "10px" }}
        placeholder="Enter your prompt here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <button
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#FFF",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "10px",
        }}
        onClick={generateText}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Text"}
      </button>
      <div>
        <h3>Generated Text:</h3>
        <p>{generatedText}</p>
      </div>
    </div>
  );
};

export default HuggingFaceInference;
