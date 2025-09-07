import React, { useRef } from 'react';

// Replicating the Variant type from the main app
interface Variant {
  displayImageUrl: string;
  truthLockStatus: 'verifying' | 'verified' | 'modified';
}

interface CanvasCardProps {
  variant: Variant | null;
  isLoading: boolean;
  error: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CanvasCard: React.FC<CanvasCardProps> = ({ variant, isLoading, error, onFileChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleContainerClick = () => {
    // Only allow click-to-upload when there's no image and not loading
    if (!variant && !isLoading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isLoading || variant) return; // Don't allow drop if loading or has content

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = {
        target: { files: e.dataTransfer.files },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(syntheticEvent);
      e.dataTransfer.clearData();
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p>Generating amazing new slides...</p>
        </div>
      );
    }
    if (error) {
      return <div className="error-message" role="alert">{error}</div>;
    }
    if (variant) {
      const badgeText = variant.truthLockStatus === 'verified'
        ? '0 values changed'
        : 'Content modified';

      return (
        <>
          <img src={variant.displayImageUrl} alt="Generated slide" className="canvas-image" />
          <div className={`canvas-badge ${variant.truthLockStatus}`}>
            {badgeText}
          </div>
        </>
      );
    }
    return (
      <div className="canvas-placeholder-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="var(--placeholder-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="var(--placeholder-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 18V12" stroke="var(--placeholder-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 15H15" stroke="var(--placeholder-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <h3>Drop slide here</h3>
        <p>or click to upload</p>
      </div>
    );
  };

  // Determine container classes based on state
  const containerClasses = [
    'canvas-card',
    isLoading ? 'loading' : '',
    error ? 'error' : '',
    variant ? 'has-content' : '',
  ].filter(Boolean).join(' ');

  return (
    <main className="canvas-card-container">
        <div
            className={containerClasses}
            onClick={handleContainerClick}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            role="button"
            aria-label="Slide upload and display area"
            tabIndex={0}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                style={{ display: 'none' }}
                accept="image/png, image/jpeg"
                aria-hidden="true"
            />
            {renderContent()}
        </div>
    </main>
  );
};

export default CanvasCard;