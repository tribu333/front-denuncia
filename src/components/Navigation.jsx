import React from 'react';
import './Navigation.css';

const Navigation = ({ 
  title, 
  subtitle, 
  showAuth = true,
  isAuthenticated = false,
  onLoginClick, 
  onLogoutClick 
}) => {
  return (
    <div className="navigation-header">
      <div className="navigation-content">
        <div className="navigation-title-section">
          <h1 className="navigation-title">{title}</h1>
          {subtitle && <p className="navigation-subtitle">{subtitle}</p>}
        </div>
        
        <div className="navigation-actions">
          {showAuth && !isAuthenticated && (
            <button 
              onClick={onLoginClick}
              className="btn btn-login-nav"
            >
              🔐 Iniciar Sesión
            </button>
          )}
          
          {showAuth && isAuthenticated && (
            <button 
              onClick={onLogoutClick}
              className="btn btn-logout-nav"
            >
              🔓 Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navigation;