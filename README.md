# Slide Surgeon

**Your Slide, Reimagined. A pitch-ready makeover in under a minute.**

---

**[➡️ Live Demo](YOUR_AI_STUDIO_APP_URL)** | **[🎬 Watch the Video Demo](YOUR_YOUTUBE_LINK)**

---

Slide Surgeon is an intelligent design assistant that transforms cluttered, messy presentation slides into clean, professional, and pitch-ready visuals. Simply upload your slide, choose a style, and let our AI-powered pipeline deconstruct the core information and reconstruct it into a stunning new design.

## Key Features

-   **The 'Deconstruct-Reconstruct' Pipeline:** Our core innovation. Instead of just editing pixels, Slide Surgeon first uses Gemini to perform a "smart OCR," deconstructing your slide's content into a structured JSON object. It then uses this data as the single source of truth to reconstruct a completely new, clean visual from scratch.

-   **Truth Guard:** We guarantee data integrity. Because we separate the data from the presentation, the "reconstruction" phase can creatively redesign the layout, colors, and typography without ever altering the original numbers, labels, and key takeaways from your slide.

-   **Conversational Editing:** Fine-tune the result with simple, natural language. Just type your instructions like "make the headline blue" or "use a bar chart instead" to iteratively refine the design until it's perfect.

-   **Professional Export:** Download your finished slide as a high-resolution, 16:9 PNG with a clean white background, ready to be dropped directly into your PowerPoint or Google Slides presentation.

## Technical Architecture

Slide Surgeon is a modern web application built with a focus on a seamless user experience.

-   **Frontend:** A responsive and performant user interface built with **React** and standard web technologies (CSS, HTML).
-   **AI & Logic:** We leverage the power of Google's Gemini models for our core pipeline:
    -   **`gemini-2.5-flash`**: Powers the "Deconstruct" phase, analyzing the uploaded image to extract structured JSON data.
    -   **`gemini-2.5-flash-image-preview`**: Powers the "Reconstruct" phase, generating the new visual representation from the JSON data and applying conversational edits.

## How to Run Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/shivam93/Nano-Banana-Hackathon.git
    cd Nano-Banana-Hackathon
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set your API Key:**
    Create a file named `.env` in the root of the project and add your Google AI Studio API key:
    ```
    API_KEY=YOUR_GEMINI_API_KEY
    ```

4.  **Run the development server:**
    This project uses Vite. To start the local development server, run:
    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173` (or the next available port).