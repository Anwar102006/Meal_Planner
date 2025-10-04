import React, { useState } from 'react';
import styled from 'styled-components';

// Styled Components for Modern Recipe Card
const CardContainer = styled.article`
  background: var(--color-surface-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  transition: all var(--transition-base);
  cursor: pointer;
  position: relative;
  box-shadow: var(--shadow-sm);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-brand-primary);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  overflow: hidden;
  height: 200px;
  background: var(--color-surface-secondary);
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent);
    opacity: 0;
    transition: opacity var(--transition-base);
  }
  
  ${CardContainer}:hover &::after {
    opacity: 1;
  }
`;

const RecipeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
  
  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-3xl);
`;

const CardContent = styled.div`
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
`;

const RecipeTitle = styled.h3`
  font-family: var(--font-family-heading);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-2);
  margin: var(--spacing-3) 0;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NutritionItem = styled.div`
  background: var(--color-surface-secondary);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-sm);
  
  .label {
    color: var(--color-text-tertiary);
    font-weight: var(--font-weight-medium);
  }
  
  .value {
    color: var(--color-text-primary);
    font-weight: var(--font-weight-semibold);
  }
`;

const IngredientsList = styled.div`
  max-height: 120px;
  overflow-y: auto;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--color-surface-secondary);
    border-radius: var(--radius-full);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--color-brand-primary);
    border-radius: var(--radius-full);
  }
`;

const IngredientsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  
  span {
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
  }
  
  .count {
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
    padding: var(--spacing-1) var(--spacing-2);
    border-radius: var(--radius-full);
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
  }
`;

const IngredientItem = styled.div`
  padding: var(--spacing-1_5) var(--spacing-3);
  margin-bottom: var(--spacing-1);
  background: var(--color-surface-tertiary);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardActions = styled.div`
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-2);
`;

const AddButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-primary-hover));
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--spacing-3) var(--spacing-4);
  font-family: var(--font-family-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: 2px solid var(--color-brand-primary);
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
    background: rgba(255, 255, 255, 0.4);
    transition: width 0.3s, height 0.3s;
    transform: translate(-50%, -50%);
  }
  
  &:active::after {
    width: 200px;
    height: 200px;
  }
`;

const ActionButton = styled.button`
  background: var(--color-surface-secondary);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-3);
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: var(--color-brand-primary-light);
    color: var(--color-brand-primary);
    border-color: var(--color-brand-primary);
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const LoadingPlaceholder = styled.div`
  background: var(--color-surface-secondary);
  border-radius: var(--radius-lg);
  height: 20px;
  animation: pulse 2s ease-in-out infinite alternate;
  
  &.title {
    height: 24px;
    width: 80%;
  }
  
  &.ingredient {
    height: 16px;
    margin-bottom: var(--spacing-2);
  }
`;

function RecipeCard({ image, title, ingredients = [], nutrition, onAdd, isLoading = false }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = () => {
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (isLoading) {
    return (
      <CardContainer>
        <ImageContainer>
          <LoadingPlaceholder style={{ height: '100%', borderRadius: 0 }} />
        </ImageContainer>
        <CardContent>
          <LoadingPlaceholder className="title" />
          <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
            <LoadingPlaceholder style={{ flex: 1, height: '32px' }} />
            <LoadingPlaceholder style={{ flex: 1, height: '32px' }} />
          </div>
          <div>
            <LoadingPlaceholder className="ingredient" />
            <LoadingPlaceholder className="ingredient" />
            <LoadingPlaceholder className="ingredient" style={{ width: '60%' }} />
          </div>
          <LoadingPlaceholder style={{ height: '44px' }} />
        </CardContent>
      </CardContainer>
    );
  }
  
  return (
    <CardContainer role="article" aria-label={`Recipe: ${title}`}>
      <ImageContainer>
        {imageError ? (
          <ImagePlaceholder>
            🍽️
          </ImagePlaceholder>
        ) : (
          <RecipeImage
            src={image}
            alt={title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity var(--transition-base)'
            }}
          />
        )}
        
        {!imageLoaded && !imageError && (
          <ImagePlaceholder>
            <div className="animate-pulse">🍽️</div>
          </ImagePlaceholder>
        )}
      </ImageContainer>
      
      <CardContent>
        <RecipeTitle>{title}</RecipeTitle>
        
        {/* Nutrition Information */}
        {nutrition && (
          <NutritionGrid>
            {nutrition.calories && (
              <NutritionItem>
                <span className="label">Calories</span>
                <span className="value">{nutrition.calories}</span>
              </NutritionItem>
            )}
            {nutrition.protein && (
              <NutritionItem>
                <span className="label">Protein</span>
                <span className="value">{nutrition.protein}g</span>
              </NutritionItem>
            )}
            {nutrition.fat && (
              <NutritionItem>
                <span className="label">Fat</span>
                <span className="value">{nutrition.fat}g</span>
              </NutritionItem>
            )}
            {nutrition.carbs && (
              <NutritionItem>
                <span className="label">Carbs</span>
                <span className="value">{nutrition.carbs}g</span>
              </NutritionItem>
            )}
          </NutritionGrid>
        )}
        
        {/* Ingredients List */}
        {ingredients && ingredients.length > 0 && (
          <div>
            <IngredientsHeader>
              <span>Ingredients</span>
              <span className="count">{ingredients.length}</span>
            </IngredientsHeader>
            <IngredientsList>
              {ingredients.slice(0, 6).map((ingredient, idx) => (
                <IngredientItem key={idx}>
                  {ingredient}
                </IngredientItem>
              ))}
              {ingredients.length > 6 && (
                <IngredientItem style={{ 
                  color: 'var(--color-text-muted)', 
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  +{ingredients.length - 6} more ingredients
                </IngredientItem>
              )}
            </IngredientsList>
          </div>
        )}
        
        {/* Action Buttons */}
        <CardActions>
          <AddButton onClick={onAdd} aria-label={`Add ${title} to meal plan`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: 'var(--spacing-2)' }}>
              <path 
                d="M12 5V19M5 12H19" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
            Add to Plan
          </AddButton>
          
          <ActionButton aria-label={`Save ${title} to favorites`}>
            <svg viewBox="0 0 24 24" fill="none">
              <path 
                d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.5783 8.50903 2.9987 7.05 2.9987C5.59096 2.9987 4.19169 3.5783 3.16 4.61C2.1283 5.6417 1.5487 7.04097 1.5487 8.5C1.5487 9.95903 2.1283 11.3583 3.16 12.39L12 21.23L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6053C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.06211 22.0329 6.39467C21.7563 5.72723 21.351 5.1208 20.84 4.61V4.61Z" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </ActionButton>
        </CardActions>
      </CardContent>
    </CardContainer>
  );
}

export default RecipeCard;
