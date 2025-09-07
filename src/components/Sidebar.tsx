import React, { useState, useEffect } from 'react';

type StylePreset = 'Executive' | 'Workshop' | 'Investor';

interface SidebarProps {
  originalImage: File | null;
  fusionImage: File | null; // New prop for fusion image
  stylePreset: StylePreset;
  isLoading: boolean;
  // FIX: Add isDataSlide to the component's props interface.
  isDataSlide: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onFusionFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void; // New callback
  onStyleSelect: (preset: StylePreset) => void;
  // FIX: Add onIsDataSlideChange to the component's props interface.
  onIsDataSlideChange: (isData: boolean) => void;
  onGenerate: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  originalImage,
  fusionImage,
  stylePreset,
  isLoading,
  // FIX: Destructure the isDataSlide prop.
  isDataSlide,
  onFileChange,
  onFusionFileChange,
  onStyleSelect,
  // FIX: Destructure the onIsDataSlideChange prop.
  onIsDataSlideChange,
  onGenerate,
}) => {
  const presets: StylePreset[] = ['Executive', 'Workshop', 'Investor'];
  const [fusionImagePreview, setFusionImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!fusionImage) {
        setFusionImagePreview(null);
        return;
    }

    const objectUrl = URL.createObjectURL(fusionImage);
    setFusionImagePreview(objectUrl);

    // Clean up the object URL on component unmount or when the file changes
    return () => URL.revokeObjectURL(objectUrl);
  }, [fusionImage]);


  const handleUploadClick = (inputId: string) => {
    document.getElementById(inputId)?.click();
  };

  return (
    <aside className="sidebar" aria-label="Controls">
      <div className="form-group">
        <label>1. Upload your slide</label>
        <input
          id="image-upload"
          type="file"
          accept="image/png, image/jpeg"
          onChange={onFileChange}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
        <button
            onClick={() => handleUploadClick('image-upload')}
            className="upload-button"
            aria-describedby="file-name"
        >
            Choose File
        </button>
        <span id="file-name" className="file-name" aria-live="polite">
            {originalImage ? originalImage.name : 'No file selected (PNG or JPG)'}
        </span>
      </div>

      <fieldset className="form-group">
        <legend>2. Choose a style</legend>
        <div className="style-presets">
          {presets.map((preset) => (
            <button
              key={preset}
              className={`preset-button ${stylePreset === preset ? 'active' : ''}`}
              onClick={() => onStyleSelect(preset)}
              disabled={!originalImage}
              aria-pressed={stylePreset === preset}
            >
              {preset}
            </button>
          ))}
        </div>
      </fieldset>

      {/* FIX: Add a checkbox to toggle the data slide option. */}
      <div className="form-group">
        <label htmlFor="data-slide-toggle" style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
          <input
            id="data-slide-toggle"
            type="checkbox"
            checked={isDataSlide}
            onChange={(e) => onIsDataSlideChange(e.target.checked)}
            disabled={!originalImage}
            style={{marginRight: '0.5rem'}}
          />
          This is a data/chart slide
        </label>
      </div>

      <fieldset className="form-group">
        <legend>3. Brand/Product Fusion (Optional)</legend>
        <input
            id="fusion-image-upload"
            type="file"
            accept="image/png, image/jpeg"
            onChange={onFusionFileChange}
            style={{ display: 'none' }}
            aria-hidden="true"
        />
        <button
            onClick={() => handleUploadClick('fusion-image-upload')}
            className="upload-button"
            aria-describedby="fusion-file-name"
            disabled={!originalImage}
        >
            Upload Fusion Image
        </button>
        <span id="fusion-file-name" className="file-name" aria-live="polite">
            {fusionImage ? fusionImage.name : 'No file selected'}
        </span>
        {fusionImagePreview && (
            <img src={fusionImagePreview} alt="Fusion preview" className="fusion-thumbnail" />
        )}
      </fieldset>

      <button
        onClick={onGenerate}
        disabled={!originalImage || isLoading}
        className="generate-button"
        aria-label="Generate new slide variants"
      >
        {isLoading ? 'Generating...' : 'Generate Variants'}
      </button>
    </aside>
  );
};

export default Sidebar;
