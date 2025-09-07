import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="app-header-wrapper">
            <div className="app-header">
                <div className="header-title-group">
                    <h1 className="app-title">Slide Surgeon</h1>
                    <p className="app-subtitle">
                        Make any slide beautiful in ~60s
                    </p>
                </div>
            </div>
        </header>
    );
};

export default Header;
