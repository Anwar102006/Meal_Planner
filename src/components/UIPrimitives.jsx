import styled, { css } from 'styled-components';

// Button Variants
const buttonVariants = {
  primary: css`
    background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-primary-hover));
    color: var(--color-text-inverse);
    border: 1px solid var(--color-brand-primary);
    
    &:hover {
      background: linear-gradient(135deg, var(--color-brand-primary-hover), var(--color-brand-primary));
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
    }
  `,
  
  secondary: css`
    background: var(--color-surface-secondary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border-primary);
    
    &:hover {
      background: var(--color-brand-primary-light);
      color: var(--color-brand-primary);
      border-color: var(--color-brand-primary);
      transform: translateY(-1px);
      box-shadow: var(--shadow-sm);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      border-color: var(--color-brand-primary);
    }
  `,
  
  success: css`
    background: linear-gradient(135deg, var(--color-semantic-success), #059669);
    color: var(--color-text-inverse);
    border: 1px solid var(--color-semantic-success);
    
    &:hover {
      background: linear-gradient(135deg, #059669, var(--color-semantic-success));
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.3);
    }
  `,
  
  danger: css`
    background: linear-gradient(135deg, var(--color-semantic-error), #dc2626);
    color: var(--color-text-inverse);
    border: 1px solid var(--color-semantic-error);
    
    &:hover {
      background: linear-gradient(135deg, #dc2626, var(--color-semantic-error));
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
    }
  `,
  
  ghost: css`
    background: transparent;
    color: var(--color-text-secondary);
    border: 1px solid transparent;
    
    &:hover {
      background: var(--color-surface-secondary);
      color: var(--color-text-primary);
      border-color: var(--color-border-primary);
    }
    
    &:focus {
      background: var(--color-surface-secondary);
      border-color: var(--color-brand-primary);
    }
  `
};

// Button Sizes
const buttonSizes = {
  sm: css`
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md);
    min-height: 36px;
  `,
  
  md: css`
    padding: var(--spacing-3) var(--spacing-4);
    font-size: var(--font-size-base);
    border-radius: var(--radius-lg);
    min-height: 44px;
  `,
  
  lg: css`
    padding: var(--spacing-4) var(--spacing-6);
    font-size: var(--font-size-lg);
    border-radius: var(--radius-xl);
    min-height: 52px;
  `
};

// Modern Button Component
export const Button = styled.button`
  font-family: var(--font-family-primary);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-base);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  text-decoration: none;
  user-select: none;
  position: relative;
  overflow: hidden;
  white-space: nowrap;
  
  /* Apply size styles */
  ${props => buttonSizes[props.size || 'md']}
  
  /* Apply variant styles */
  ${props => buttonVariants[props.variant || 'primary']}
  
  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
  
  /* Loading state */
  ${props => props.loading && css`
    color: transparent;
    pointer-events: none;
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 16px;
      height: 16px;
      margin: -8px 0 0 -8px;
      border: 2px solid;
      border-color: currentColor transparent currentColor transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `}
  
  /* Full width option */
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

// Input Component
export const Input = styled.input`
  font-family: var(--font-family-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-primary);
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
  transition: all var(--transition-base);
  width: 100%;
  
  &::placeholder {
    color: var(--color-text-muted);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    background: var(--color-surface-primary);
  }
  
  &:disabled {
    background: var(--color-surface-secondary);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
  
  /* Error state */
  ${props => props.error && css`
    border-color: var(--color-semantic-error);
    
    &:focus {
      border-color: var(--color-semantic-error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}
  
  /* Sizes */
  ${props => props.size === 'sm' && css`
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-sm);
    border-radius: var(--radius-md);
  `}
  
  ${props => props.size === 'lg' && css`
    padding: var(--spacing-4) var(--spacing-5);
    font-size: var(--font-size-lg);
    border-radius: var(--radius-xl);
  `}
`;

// Card Component
export const Card = styled.div`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  
  ${props => props.hover && css`
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--color-brand-primary);
    }
  `}
  
  ${props => props.padding && css`
    padding: var(--spacing-${props.padding});
  `}
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-4);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all var(--transition-base);
`;

export const ModalContent = styled.div`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-6);
  max-width: ${props => props.maxWidth || '500px'};
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
  position: relative;
  transform: translateY(${props => props.isOpen ? '0' : '20px'});
  transition: all var(--transition-base);
`;

// Utility Components
export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  flex-direction: ${props => props.direction || 'row'};
  gap: ${props => props.gap ? `var(--spacing-${props.gap})` : '0'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

// Badge Component
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  
  ${props => props.variant === 'primary' && css`
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
  `}
  
  ${props => props.variant === 'success' && css`
    background: var(--color-semantic-success-light);
    color: var(--color-semantic-success);
  `}
  
  ${props => props.variant === 'warning' && css`
    background: var(--color-semantic-warning-light);
    color: var(--color-semantic-warning);
  `}
  
  ${props => props.variant === 'danger' && css`
    background: var(--color-semantic-error-light);
    color: var(--color-semantic-error);
  `}
`;

import styled from 'styled-components'

export const Card = styled.div`
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 16px;
  box-shadow: var(--shadow-md);
  transition: transform var(--transition), box-shadow var(--transition);
  border: 1px solid rgba(11,19,40,0.03);

  &:hover{ transform: translateY(-6px); box-shadow: 0 24px 46px rgba(11,19,40,0.08) }

  &.compact { padding: 10px }
`;

export const Button = styled.button`
  border: none;
  padding: 10px 14px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: transform var(--transition), box-shadow var(--transition), background var(--transition);
  display:inline-flex;
  align-items:center;
  gap:8px;

  &.primary{
    background: linear-gradient(90deg, var(--primary), var(--accent));
    color: white;
    box-shadow: 0 8px 22px rgba(51,102,255,0.12);
  }

  &.ghost{
    background: transparent;
    color: var(--text);
    border: 1px solid rgba(15,23,42,0.06);
  }

  &:active{ transform: translateY(1px) scale(0.998) }
  &:focus{ box-shadow: 0 6px 18px rgba(51,102,255,0.12) }
`;

export default { Card, Button };
