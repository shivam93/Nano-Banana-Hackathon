/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { DEMO_DATA } from './src/demo-data'; // Import the demo data
import Header from './src/components/Header';
import Canvas from './src/components/Canvas';
import CommandBar from './src/components/CommandBar';


// --- Updated Interface with Source and Display URLs ---
interface Variant {
  id: string;
  sourceGraphicUrl: string; // The raw graphic from the API, expected to have a white background
  displayImageUrl: string;  // The 16:9 processed version for the UI
  truthLockStatus: 'verifying' | 'verified' | 'modified';
}

type StylePreset = 'Executive' | 'Workshop' | 'Investor';

// --- Helper Functions ---
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

/**
 * Takes a raw image data URL and composites it onto a 16:9 canvas
 * with a white background for consistent UI display.
 */
const processFinalImage = async (imageDataUrl: string, backgroundColor: string = '#FFFFFF', targetWidth: number = 1920): Promise<string> => {
    return new Promise((resolve, reject) => {
        const targetHeight = (targetWidth / 16) * 9; // 16:9 aspect ratio

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            return reject(new Error('Could not get canvas context'));
        }

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.onload = () => {
            // Calculate dimensions to fit image within canvas while maintaining aspect ratio (object-fit: contain)
            const hRatio = canvas.width / img.width;
            const vRatio = canvas.height / img.height;
            const ratio = Math.min(hRatio, vRatio);

            const centerShift_x = (canvas.width - img.width * ratio) / 2;
            const centerShift_y = (canvas.height - img.height * ratio) / 2;

            // Draw the image centered
            ctx.drawImage(
                img,
                0, 0, img.width, img.height,
                centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
            );

            // Resolve with the new data URL
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
            reject(new Error('Failed to load image for processing.'));
        };
        img.src = imageDataUrl;
    });
};


// --- PROMPTS ---
const MASTER_RECONSTRUCT_PROMPT = `
  Persona: You are a world-class information designer and visual artist at a top-tier consulting firm.

  Task: Your task is to create a single, stunning, and clear visual representation of the provided JSON data. Do not show the JSON data itself; visualize the information it contains.

  Design System Rules:
  -   Adhere to a strict 8pt grid for all spacing and alignment.
  -   Use a professional and clean sans-serif font like "Inter".
  -   Typographic Scale: Headline (32px, Bold), Label (14px, Medium), Caption (12px, Regular).
  -   Use high-quality, single-color, line-art icons (like Material Symbols) to represent concepts where appropriate.

  Data Visualization Best Practices:
  -   Maximize the data-ink ratio. Remove all unnecessary chart junk.
  -   Use color strategically to highlight key insights, but maintain a professional and clean aesthetic.

  Critical Constraints:
  -   Render the final graphic on a pure white (#FFFFFF) background. Do not draw or simulate transparency (no gray/white checkerboards). Do not add any drop shadows or watermarks.
  -   You MUST propose a new, concise headline for the visual as a separate piece of text. The headline MUST NOT be rendered on the image itself.

  Context:
  -   Style Preset: {{stylePreset}} (Use this to guide your color palette and overall aesthetic: 'Executive' is formal and minimalist, 'Workshop' is collaborative and colorful, 'Investor' is data-dense and impactful).
  -   JSON Data to Visualize:
      \`\`\`json
      {{jsonData}}
      \`\`\`

  Format:
  -   Your response MUST contain two distinct parts:
      1. A single line of text for the proposed title.
      2. The generated image file.
`;

// --- Main App Component ---
function App() {
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [stylePreset, setStylePreset] = useState<StylePreset>('Workshop');
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTweaking, setIsTweaking] = useState<boolean>(false);
  const [tweakRequest, setTweakRequest] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [compareOn, setCompareOn] = useState<boolean>(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setVariants([]);
    setCompareOn(false);
    if (event.target.files && event.target.files[0]) {
      setOriginalImage(event.target.files[0]);
    }
  };

  const handleStylePresetChange = (preset: StylePreset) => {
    setStylePreset(preset);
  };

  const onCompareToggle = () => setCompareOn(prev => !prev);

  const onExportPng = async (variantId: string) => {
    const variantToExport = variants.find(v => v.id === variantId);
    if (!variantToExport) {
        console.error("Could not find variant to export.");
        setError("Could not find the specified variant to export.");
        return;
    }

    let exportUrl = variantToExport.displayImageUrl;

    // Fallback if displayImageUrl isn't ready for some reason
    if (!exportUrl) {
        console.warn("displayImageUrl not found for export, processing from sourceGraphicUrl as a fallback.");
        try {
            exportUrl = await processFinalImage(variantToExport.sourceGraphicUrl);
        } catch (e) {
            console.error("Failed to process fallback image for export:", e);
            setError("Could not process the image for export. Please try again.");
            return;
        }
    }


    try {
        const link = document.createElement('a');
        link.href = exportUrl;
        link.download = 'slide_surgeon_export.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (e) {
        console.error("Failed to export image:", e);
        setError("Could not export the image. Please try again.");
    }
  };

  const runOcrOnImage = async (imageFile: File): Promise<any> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64ImageData = await fileToBase64(imageFile);

      const ocrPrompt = `Analyze the provided slide image. Deconstruct it into a structured JSON object. The JSON should capture the core informational content, not just the text. Infer the structure (e.g., list, hierarchy, table). For charts, extract data points, labels, and the chart type.

      Example for a simple list:
      { "type": "list", "title": "Key Takeaways", "items": ["First point", "Second point"] }

      Example for a bar chart:
      { "type": "bar_chart", "title": "Q3 Performance", "data": [{"label": "Product A", "value": 75}, {"label": "Product B", "value": 50}] }

      Return ONLY the raw JSON object.`;

      const imagePart = {
        inlineData: {
          data: base64ImageData,
          mimeType: imageFile.type,
        },
      };

      const textPart = {
        text: ocrPrompt,
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
        },
      });

      const jsonString = response.text.trim();
      return JSON.parse(jsonString);

    } catch (e) {
      console.error('An error occurred during OCR processing:', e);
      return {
          error: "OCR failed to produce valid JSON.",
          extractedContent: [],
          notes: "This data was extracted via a failed OCR attempt. Reconstruct the most logical visual representation of an empty slide."
      };
    }
  };

  const handleGenerateVariants = async () => {
    if (!originalImage) {
        setError('Please upload an image first.');
        return;
    }

    setIsLoading(true);
    setCompareOn(false);
    setError(null);
    setVariants([]);

    try {
        let structuredJson: any;
        const isDemoFile = Object.keys(DEMO_DATA).includes(originalImage.name);

        if (isDemoFile) {
            console.log(`Using demo data for: ${originalImage.name}`);
            structuredJson = DEMO_DATA[originalImage.name as keyof typeof DEMO_DATA];
        } else {
            console.log('Running live smart OCR on user image...');
            structuredJson = await runOcrOnImage(originalImage);
            if (structuredJson.error) {
              throw new Error("Smart OCR failed to extract structured content from the slide. Please try a different image.");
            }
        }

        let finalPrompt = MASTER_RECONSTRUCT_PROMPT
            .replace('{{stylePreset}}', stylePreset)
            .replace('{{jsonData}}', JSON.stringify(structuredJson, null, 2));

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const textPart = { text: finalPrompt };

        const GENERATION_TIMEOUT_MS = 60000;
        const generationPromise = ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: { parts: [textPart] },
            config: {
                 responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Generation timed out. The request took too long, please try again.')), GENERATION_TIMEOUT_MS)
        );

        const response = await Promise.race([generationPromise, timeoutPromise]) as any;

        const parts = response.candidates?.[0]?.content?.parts;
        if (!parts || parts.length < 2) {
            throw new Error("Sorry, the model didn't return both a title and an image. Please try again.");
        }

        const textPartResponse = parts.find((part: any) => part.text);
        const imagePartResponse = parts.find((part: any) => part.inlineData);

        if (!textPartResponse || !imagePartResponse) {
            throw new Error("The model response was missing either the text or image part.");
        }

        const proposedTitle = textPartResponse.text;
        console.log("Proposed Title:", proposedTitle);

        const { mimeType, data } = imagePartResponse.inlineData;
        const sourceGraphicUrl = `data:${mimeType};base64,${data}`;
        const displayImageUrl = await processFinalImage(sourceGraphicUrl);

        const finalVariant: Variant = {
            id: crypto.randomUUID(),
            sourceGraphicUrl,
            displayImageUrl,
            truthLockStatus: 'verified',
        };

        setVariants([finalVariant]);

    } catch (e: any) {
        console.error(e);
        setError(e.message || 'An error occurred while generating variants. Please check the console.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleApplyTweak = async (variantId: string, tweakText: string) => {
    setIsTweaking(true);
    setError(null);

    const variantToTweak = variants.find(v => v.id === variantId);

    if (!variantToTweak) {
        setError("Could not find the variant to tweak.");
        setIsTweaking(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const match = variantToTweak.sourceGraphicUrl.match(/^data:(.+);base64,(.+)$/);
        if (!match) {
            throw new Error("Invalid data URL format for the variant image.");
        }
        const [, mimeType, base64ImageData] = match;

        const tweakPrompt = `
          You are an AI design assistant specializing in presentation slides.
          A user wants to apply a specific change to the provided image.
          Analyze the user's request and modify the image accordingly.

          Critical Constraints:
          - Your ONLY output must be the newly modified image file.
          - The output image MUST be rendered on a pure white (#FFFFFF) background. Do not draw or simulate transparency (no gray/white checkerboards). Do not add any drop shadows or watermarks.
          - Do not output any text, commentary, or markdown.
        `;

        const originalImagePart = {
            inlineData: { data: base64ImageData, mimeType },
        };
        const promptPart = { text: tweakPrompt };
        const tweakRequestPart = { text: tweakText };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [promptPart, originalImagePart, tweakRequestPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

        if (imagePart?.inlineData) {
            const { mimeType: newMimeType, data } = imagePart.inlineData;
            const newSourceGraphicUrl = `data:${newMimeType};base64,${data}`;
            const newDisplayImageUrl = await processFinalImage(newSourceGraphicUrl);

            setVariants(currentVariants =>
                currentVariants.map(v =>
                    v.id === variantId
                        ? {
                            ...v,
                            sourceGraphicUrl: newSourceGraphicUrl,
                            displayImageUrl: newDisplayImageUrl,
                            truthLockStatus: 'modified'
                          }
                        : v
                )
            );
        } else {
            throw new Error("The model did not return a new image for the tweak.");
        }

    } catch (e) {
        console.error("An error occurred during the tweak operation:", e);
        setError("Sorry, the tweak could not be applied. Please try again.");
    } finally {
        setIsTweaking(false);
    }
  };

  const handleImproveSlide = () => {
    if (variants.length > 0 && tweakRequest.trim()) {
        handleApplyTweak(variants[0].id, tweakRequest);
    } else {
        handleGenerateVariants();
    }
  };

  return (
    <div className="app-container">
      <header className="app-header-wrapper">
        <Header />
      </header>
      <main className="main-content">
        <Canvas
            originalImage={originalImage}
            generatedImage={variants[0]?.displayImageUrl || null}
            isLoading={isLoading || isTweaking}
            onFileChange={handleImageUpload}
            truthLockStatus={variants[0]?.truthLockStatus || null}
            compareOn={compareOn}
            onCompareToggle={onCompareToggle}
            onExportPng={() => {
                if (variants.length > 0) {
                    onExportPng(variants[0].id);
                }
            }}
            variantExists={variants.length > 0}
        />
      </main>
      <footer className="command-bar-container">
        <CommandBar
          stylePreset={stylePreset}
          onStyleChange={handleStylePresetChange}
          tweakRequest={tweakRequest}
          onTweakChange={setTweakRequest}
          onImprove={handleImproveSlide}
          isLoading={isLoading || isTweaking}
          originalImage={originalImage}
        />
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);