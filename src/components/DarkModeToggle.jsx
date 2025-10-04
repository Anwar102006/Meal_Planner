import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.button`
  background: var(--color-surface-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-full);
  padding: var(--spacing-1);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  width: 52px;
  height: 28px;
  display: flex;
  align-items: center;
  overflow: hidden;
  
  &:hover {
    background: var(--color-brand-primary-light);
    border-color: var(--color-brand-primary);
    transform: translateY(-1px);
  }
  
  &:focus {
    outline: 2px solid var(--color-brand-primary);
    outline-offset: 2px;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ToggleSlider = styled.div`
  position: absolute;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
  border-radius: 50%;
  transition: transform var(--transition-spring);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  
  transform: translateX(${props => props.isDark ? '22px' : '2px'});
  
  svg {
    width: 12px;
    height: 12px;
    color: white;
    transition: opacity var(--transition-fast);
  }
`;

const IconContainer = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-base);
  
  &.sun {
    left: 6px;
    opacity: ${props => props.isDark ? 0.3 : 1};
    color: var(--color-semantic-warning);
  }
  
  &.moon {
    right: 6px;
    opacity: ${props => props.isDark ? 1 : 0.3};
    color: var(--color-brand-primary);
  }
`;

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldUseDark);
    applyTheme(shouldUseDark);
  }, []);
  
  const applyTheme = (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };
  
  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  return (
    <ToggleContainer
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Background icons */}
      <IconContainer className="sun" isDark={isDark}>
        <svg viewBox="0 0 24 24" fill="none">
          <path 
            d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </IconContainer>
      
      <IconContainer className="moon" isDark={isDark}>
        <svg viewBox="0 0 24 24" fill="none">
          <path 
            d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.7473 21.1181 10.0713 20.746C8.39524 20.3739 6.84619 19.5345 5.61801 18.3063C4.38983 17.0781 3.55046 15.5291 3.17838 13.8531C2.8063 12.1771 2.91709 10.4364 3.49783 8.82864C4.07857 7.22084 5.10517 5.81168 6.45757 4.76608C7.80997 3.72049 9.43219 3.08166 11.1344 2.92493C9.84827 4.4738 9.16513 6.4302 9.22537 8.43051C9.28561 10.4308 10.0852 12.3425 11.4884 13.8044C12.8916 15.2663 14.8063 16.1731 16.8071 16.3542C18.8079 16.5353 20.8021 15.9787 22.4143 14.7946L21 12.79Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </IconContainer>
      
      {/* Moving slider */}
      <ToggleSlider isDark={isDark}>
        {isDark ? (
          <svg viewBox="0 0 24 24" fill="none">
            <path 
              d="M21 12.79C20.8427 14.4922 20.2039 16.1144 19.1583 17.4668C18.1127 18.8192 16.7035 19.8458 15.0957 20.4265C13.4879 21.0073 11.7473 21.1181 10.0713 20.746C8.39524 20.3739 6.84619 19.5345 5.61801 18.3063C4.38983 17.0781 3.55046 15.5291 3.17838 13.8531C2.8063 12.1771 2.91709 10.4364 3.49783 8.82864C4.07857 7.22084 5.10517 5.81168 6.45757 4.76608C7.80997 3.72049 9.43219 3.08166 11.1344 2.92493C9.84827 4.4738 9.16513 6.4302 9.22537 8.43051C9.28561 10.4308 10.0852 12.3425 11.4884 13.8044C12.8916 15.2663 14.8063 16.1731 16.8071 16.3542C18.8079 16.5353 20.8021 15.9787 22.4143 14.7946L21 12.79Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="currentColor"
            />
            <path 
              d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </ToggleSlider>
    </ToggleContainer>
  );
};

export default DarkModeToggle;
