import React from 'react';
import ArmyShieldIcon from './icons/ArmyShieldIcon';

const Header: React.FC = () => {
  return (
    <header style={{ 
      background: 'var(--bg-end)',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      borderBottom: '1px solid var(--input-border)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div className="container" style={{
        padding: '1rem',
        display: 'flex',
        alignItems: 'center'
      }}>
        <ArmyShieldIcon />
        <h1 style={{
          fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
          fontWeight: '700',
          color: 'var(--text-primary)',
        }}>
          Gerador de Cronogramas IA
        </h1>
      </div>
    </header>
  );
};

export default Header;