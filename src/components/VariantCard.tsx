import React, { useState } from 'react';

interface VariantCardProps {
  displayImageUrl: string;
  truthLockStatus: 'verifying' | 'verified' | 'modified';
  onApplyTweak: (tweakText: string) => void;
  onApplyFusion: () => void;
  onExportPng: () => void;
  isTweaking: boolean;
}

const TruthLockBadge: React.FC<{ status: VariantCardProps['truthLockStatus'] }> = ({ status }) => {
    if (status === 'verifying') {
        return (
            <div className="variant-card-badge verifying" title="Verifying content...">
                <div className="badge-spinner"></div>
            </div>
        );
    }
    const statusText = status === 'verified' ? '✓ Content Verified' : '⚠ Content Modified';
    const modifierClass = status === 'verified' ? 'verified' : 'modified';

    return <div className={`variant-card-badge ${modifierClass}`}>{statusText}</div>;
}

const VariantCard: React.FC<VariantCardProps> = ({ displayImageUrl, truthLockStatus, onApplyTweak, onApplyFusion, onExportPng, isTweaking }) => {
  const [tweak, setTweak] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (tweak.trim()) {
      onApplyTweak(tweak);
    }
  };

  return (
    <div className="variant-card">
      <TruthLockBadge status={truthLockStatus} />
      <div className="image-container">
        <img src={displayImageUrl} alt="Generated slide variant" />
      </div>
      <div className="tweak-form-container">
        <button
            onClick={onApplyFusion}
            className="tweak-apply-button"
            disabled={isTweaking}
            aria-label="Apply fusion"
            style={{width: '100%', marginBottom: '0.5rem'}}
        >
            Apply Fusion
        </button>
        <form onSubmit={handleSubmit} className="tweak-form">
            <input
                type="text"
                value={tweak}
                onChange={(e) => setTweak(e.target.value)}
                placeholder="Chat Tweak (e.g., 'make the logo blue')"
                className="tweak-input"
                aria-label="Tweak instruction"
                disabled={isTweaking}
            />
            <button
                type="submit"
                className="tweak-apply-button"
                disabled={isTweaking || !tweak.trim()}
                aria-label="Apply tweak"
            >
                {isTweaking ? 'Applying...' : 'Apply'}
            </button>
        </form>
        {/* Export Actions */}
        <div className="tweak-form" style={{marginTop: '0.5rem'}}>
            <button
                type="button"
                onClick={onExportPng}
                className="tweak-export-button"
                style={{flex: 1}}
                disabled={isTweaking}
                aria-label="Download PNG with background"
            >
                Download PNG
            </button>
        </div>
      </div>
    </div>
  );
};

export default VariantCard;