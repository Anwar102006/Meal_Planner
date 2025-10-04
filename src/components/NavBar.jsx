import React, { useState } from 'react'
import styled from 'styled-components'
import DarkModeToggle from './DarkModeToggle'

const NavbarContainer = styled.header`
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--color-surface-glass);
  border-bottom: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  
  /* Glassmorphism effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.1) 0%, 
      rgba(255, 255, 255, 0.05) 100%
    );
    pointer-events: none;
  }
  
  [data-theme='dark'] & {
    background: var(--color-surface-glass);
    border-bottom-color: var(--color-border-primary);
    
    &::before {
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.05) 0%, 
        rgba(255, 255, 255, 0.02) 100%
      );
    }
  }
`;

const NavbarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-4) var(--spacing-6);
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: var(--spacing-3) var(--spacing-4);
    gap: var(--spacing-3);
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-xl);
  color: var(--color-text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-base);
  
  &:hover {
    color: var(--color-brand-primary);
  }
  
  @media (max-width: 768px) {
    font-size: var(--font-size-lg);
    gap: var(--spacing-2);
  }
`;

const BrandIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  
  svg {
    width: 20px;
    height: 20px;
    color: white;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  
  @media (max-width: 768px) {
    gap: var(--spacing-2);
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-lg);
  border: none;
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
  
  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(99, 102, 241, 0.3);
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
  }
  
  &:active::after {
    width: 100px;
    height: 100px;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const UserAvatar = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-primary);
  background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
  color: white;
  font-family: var(--font-family-heading);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-brand-primary);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  &:focus {
    outline: 3px solid rgba(99, 102, 241, 0.3);
    outline-offset: 2px;
  }
  
  /* Glow effect on hover */
  &::before {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
    border-radius: var(--radius-full);
    opacity: 0;
    transition: opacity var(--transition-base);
    z-index: -1;
  }
  
  &:hover::before {
    opacity: 0.2;
  }
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const UserMenu = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  right: 0;
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-3);
  min-width: 200px;
  z-index: var(--z-dropdown);
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all var(--transition-base);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  
  /* Arrow pointing up */
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: var(--color-surface-primary);
    border: 1px solid var(--color-border-primary);
    border-bottom: none;
    border-right: none;
    transform: rotate(45deg);
  }
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  
  &:hover {
    background: var(--color-surface-secondary);
    color: var(--color-text-primary);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: var(--color-border-primary);
  margin: var(--spacing-2) 0;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-semantic-success-light);
  border-radius: var(--radius-lg);
  margin-bottom: var(--spacing-2);
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--color-semantic-success);
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  span {
    font-size: var(--font-size-xs);
    color: var(--color-semantic-success);
    font-weight: var(--font-weight-medium);
  }
`;

export const NavBar = ({ user }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const getUserInitials = (username) => {
    if (!username) return 'U';
    return username
      .split(' ')
      .map(name => name[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };
  
  const handleMenuClose = () => {
    setIsUserMenuOpen(false);
  };
  
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('[data-user-menu]')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);
  
  return (
    <NavbarContainer role="banner" aria-label="Main navigation">
      <NavbarContent>
        <Brand>
          <BrandIcon>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path 
                d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9M15 11H21V9H15M7 14C7.5 14 8 14.4 8 15S7.5 16 7 16 6 15.6 6 15 6.5 14 7 14M17 14C17.5 14 18 14.4 18 15S17.5 16 17 16 16 15.6 16 15 16.5 14 17 14M7 18C7.5 18 8 18.4 8 19S7.5 20 7 20 6 19.6 6 19 6.5 18 7 18M17 18C17.5 18 18 18.4 18 19S17.5 20 17 20 16 19.6 16 19 16.5 18 17 18Z" 
                fill="currentColor"
              />
            </svg>
          </BrandIcon>
          <span>Meal Planner</span>
        </Brand>
        
        <NavActions>
          <ActionButton aria-label="Search recipes">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
          
          <DarkModeToggle />
          
          <ActionButton aria-label="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <path 
                d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
          
          <UserMenuContainer data-user-menu>
            <UserAvatar 
              onClick={handleUserMenuToggle}
              aria-haspopup="true" 
              aria-expanded={isUserMenuOpen}
              aria-label={`User menu for ${user}`}
            >
              {getUserInitials(user)}
            </UserAvatar>
            
            <UserMenu isOpen={isUserMenuOpen}>
              <StatusIndicator>
                <span>Online</span>
              </StatusIndicator>
              
              <MenuItem>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Profile Settings
              </MenuItem>
              
              <MenuItem>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M19.428 15.428C20.0756 14.7804 20.5751 14.0163 20.8966 13.1832C21.2181 12.35 21.3542 11.4657 21.2973 10.5833C21.2404 9.70089 20.9919 8.84159 20.5683 8.06304C20.1447 7.28449 19.556 6.60585 18.8438 6.07923C18.1316 5.55261 17.3128 5.18969 16.4439 5.01406C15.5751 4.83844 14.6761 4.85469 13.8159 5.06141C12.9558 5.26814 12.1556 5.66043 11.4703 6.20735C10.785 6.75428 10.232 7.44376 9.85 8.22817" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                  <path 
                    d="M12 15L15 12H6L9 15" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Dietary Preferences
              </MenuItem>
              
              <MenuItem>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 11H15M9 15H15M17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H12.586C12.8512 3.00006 13.1055 3.10545 13.293 3.293L18.707 8.707C18.8946 8.89449 18.9999 9.14881 19 9.414V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Meal History
              </MenuItem>
              
              <MenuDivider />
              
              <MenuItem>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9L16 10V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H10" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Help & Support
              </MenuItem>
              
              <MenuItem style={{ color: 'var(--color-semantic-error)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path 
                    d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9L16 10V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H10M9 7H13L9 3V7Z" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
                Sign Out
              </MenuItem>
            </UserMenu>
          </UserMenuContainer>
        </NavActions>
      </NavbarContent>
    </NavbarContainer>
  )
}

export default NavBar
