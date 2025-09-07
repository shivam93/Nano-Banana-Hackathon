import React, { useRef, useState, useEffect } from 'react';

// --- Icon Components ---
const Svg = ({ size = 16, className = "", children, ...rest }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true" {...rest}
  >{children}</svg>
);
const CheckCircleIcon = (props) => (
  <Svg {...props}><circle cx="12" cy="12" r="9" /><path d="M9 12l2 2 4-4" /></Svg>
);
const AlertTriangleIcon = (props) => (
    <Svg {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></Svg>
);
const UploadIcon = (props) => (
  <Svg {...props} strokeWidth="1.5" color="#adb5bd">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </Svg>
);
const ShuffleIcon = (props) => (
    <Svg {...props}>
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
    </Svg>
);
const DownloadIcon = (props) => (
  <Svg {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
);


// --- Internal UI Components ---
const PillToggle = ({ icon, label, pressed, onToggle, disabled }) => (
    <button
        className="pill-toggle"
        aria-pressed={pressed}
        onClick={onToggle}
        disabled={disabled}
    >
        {icon}
        <span>{label}</span>
    </button>
);

interface CanvasProps {
  originalImage: File | null;
  generatedImage: string | null;
  isLoading: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  truthLockStatus: 'verifying' | 'verified' | 'modified' | null;
  compareOn: boolean;
  onCompareToggle: () => void;
  onExportPng: () => void;
  variantExists: boolean;
}

const TruthBadge: React.FC<{ status: CanvasProps['truthLockStatus'] }> = ({ status }) => {
    if (!status || status === 'verifying') return null;

    const isVerified = status === 'verified';
    const text = isVerified ? '0 values changed' : 'Content modified';
    const icon = isVerified ? <CheckCircleIcon size={14} /> : <AlertTriangleIcon size={14} />;

    return (
        <div className={`truth-badge ${!isVerified ? 'modified' : ''}`}>
            <span className="truth-badge-icon">{icon}</span>
            <span className="truth-badge-text">{text}</span>
        </div>
    );
}

const PlaceholderContent = () => (
    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
        <UploadIcon size={40} />
        <h3 style={{ margin: '16px 0 4px 0', color: 'var(--text-primary)', fontSize: '18px', fontWeight: 500 }}>
            Drop slide here
        </h3>
        <p style={{ margin: 0, fontSize: '14px', maxWidth: '320px', lineHeight: 1.5 }}>
            We’ll clean the layout—your numbers and labels stay intact.
        </p>
    </div>
);


const Canvas: React.FC<CanvasProps> = ({
    originalImage, generatedImage, isLoading, onFileChange, truthLockStatus,
    compareOn, onCompareToggle, onExportPng, variantExists
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isLoading || originalImage) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = { target: { files: e.dataTransfer.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(syntheticEvent);
    }
  };

  const hasContent = !!originalImage || !!generatedImage;
  const showCompareView = compareOn && originalImage && generatedImage;

  const renderContent = () => {
    if (showCompareView) {
        return (
            <div className="canvas-compare-view">
                <div className="canvas-compare-half">
                    <img src={URL.createObjectURL(originalImage!)} alt="Original slide" className="canvas-image" />
                </div>
                <div className="canvas-compare-divider" />
                <div className="canvas-compare-half">
                    <img src={generatedImage!} alt="Generated slide" className="canvas-image" />
                    <TruthBadge status={truthLockStatus} />
                </div>
            </div>
        );
    }
    if (generatedImage) {
      return (
          <>
            <img src={generatedImage} alt="Generated slide" className="canvas-image"/>
            <TruthBadge status={truthLockStatus} />
          </>
        );
    }
    if (originalImage) {
        return <img src={URL.createObjectURL(originalImage)} alt="Original slide" className="canvas-image" />;
    }
    return <PlaceholderContent />;
  };

  return (
    <div className="card canvas-card-outer">
      <div
        className={`canvas-card-inner ${hasContent ? 'has-content' : ''} ${isLoading ? 'is-loading' : ''}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {!hasContent && !isLoading && (
            <label htmlFor="file-upload" className="canvas-upload-label" aria-label="Upload slide image" />
        )}
        <input id="file-upload" ref={fileInputRef} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={onFileChange} style={{display: 'none'}}/>

        {isLoading && (
          <div className="spinner-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {renderContent()}

      </div>
      <div className="canvas-footer">
        <div className="canvas-file-hint">
          {originalImage ? (
            <>Selected: <span>{originalImage.name}</span></>
          ) : (
            <>PNG or JPG. Drag & drop or click to choose a file.</>
          )}
        </div>
        
        {originalImage && (
            <div className="canvas-actions">
              <PillToggle
                icon={<ShuffleIcon size={16} />}
                label="Compare"
                pressed={compareOn}
                onToggle={onCompareToggle}
                disabled={!variantExists || isLoading}
              />
              <button
                className="export-button"
                onClick={onExportPng}
                disabled={!variantExists || isLoading}
              >
                <DownloadIcon size={16} />
                Download
              </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;