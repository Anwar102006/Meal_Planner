import React, { useState } from 'react';
import { formatDateString, formatDisplayDate } from '../../utils/dateUtils.js';

const AddRecipeModal = ({ isOpen, onClose, recipe, onAddRecipe }) => {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return formatDateString(today);
  });
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');
  const [servings, setServings] = useState(1);
  const [notes, setNotes] = useState('');

  const handleAdd = () => {
    if (!selectedDate || !selectedMeal) {
      alert('Please select both date and meal type');
      return;
    }

    const recipeData = {
      recipe,
      date: new Date(selectedDate),
      mealType: selectedMeal,
      servings: parseInt(servings),
      notes: notes.trim()
    };

    onAddRecipe(recipeData);
    onClose();
    
    // Reset form
    setSelectedDate(formatDateString(new Date()));
    setSelectedMeal('Breakfast');
    setServings(1);
    setNotes('');
  };

  // Get date options for the next 30 days
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: formatDateString(date),
        label: formatDisplayDate(date),
        isToday: i === 0,
        dayName: date.toLocaleDateString('en-US', { weekday: 'long' })
      });
    }
    
    return dates;
  };

  if (!isOpen || !recipe) return null;

  const dateOptions = getDateOptions();

  return (
    <div className="delete-modal">
      <div className="delete-content" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>Add Recipe to Meal Plan</h3>
        
        {/* Recipe Preview */}
        <div style={{
          background: '#f9f9f9',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <img 
            src={recipe.image} 
            alt={recipe.title} 
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '8px',
              objectFit: 'cover'
            }}
          />
          <div>
            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>
              {recipe.title}
            </h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
              {recipe.category} • {recipe.area}
            </p>
            {recipe.nutrition && (
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#888' }}>
                {recipe.nutrition.calories} calories
              </p>
            )}
          </div>
        </div>
        
        {/* Date Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            📅 Select Date:
          </label>
          <select 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              border: '2px solid #ddd',
              fontSize: '0.95rem',
              background: 'white'
            }}
          >
            {dateOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.isToday ? '🌟 ' : ''}
                {option.dayName}, {option.label}
                {option.isToday ? ' (Today)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Meal Type Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            🍽️ Meal Type:
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
              <label key={meal} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.5rem 1rem',
                border: '2px solid',
                borderColor: selectedMeal === meal ? '#4a90e2' : '#ddd',
                borderRadius: '2rem',
                cursor: 'pointer',
                backgroundColor: selectedMeal === meal ? '#f0f8ff' : 'white',
                fontSize: '0.9rem',
                fontWeight: selectedMeal === meal ? 'bold' : 'normal'
              }}>
                <input
                  type="radio"
                  name="mealType"
                  value={meal}
                  checked={selectedMeal === meal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                  style={{ marginRight: '0.5rem' }}
                />
                {meal}
              </label>
            ))}
          </div>
        </div>

        {/* Servings */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            👥 Servings:
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            style={{ 
              width: '100px', 
              padding: '0.5rem', 
              borderRadius: '0.25rem', 
              border: '2px solid #ddd',
              fontSize: '0.95rem'
            }}
          />
          <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
            people
          </span>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}>
            📝 Notes (optional):
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special notes or modifications..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '2px solid #ddd',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'flex-end',
          borderTop: '1px solid #eee',
          paddingTop: '1rem'
        }}>
          <button 
            className="filter-btn" 
            onClick={onClose}
            style={{
              background: '#f5f5f5',
              color: '#666',
              border: '2px solid #ddd'
            }}
          >
            Cancel
          </button>
          <button 
            className="filter-btn" 
            onClick={handleAdd}
            style={{
              background: '#4a90e2',
              color: 'white',
              border: '2px solid #4a90e2',
              fontWeight: 'bold'
            }}
          >
            ➕ Add to Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRecipeModal;