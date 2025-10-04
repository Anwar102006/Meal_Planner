import React, { useState } from 'react';
import { formatDateString, formatDisplayDate, getCurrentWeek, getWeekEnd } from '../../utils/dateUtils.js';

const GroceryDownloadModal = ({ isOpen, onClose, onDownload, currentMealPlan }) => {
  const currentWeekData = getCurrentWeek();
  const [startDate, setStartDate] = useState(formatDateString(currentWeekData.start));
  const [endDate, setEndDate] = useState(formatDateString(currentWeekData.end));
  const [selectedOption, setSelectedOption] = useState('current-week');

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    const today = new Date();
    
    switch (option) {
      case 'today':
        setStartDate(formatDateString(today));
        setEndDate(formatDateString(today));
        break;
      case 'current-week':
        setStartDate(formatDateString(currentWeekData.start));
        setEndDate(formatDateString(currentWeekData.end));
        break;
      case 'next-week':
        const nextWeekStart = new Date(today);
        nextWeekStart.setDate(today.getDate() + 7);
        const nextWeekEnd = getWeekEnd(nextWeekStart);
        setStartDate(formatDateString(nextWeekStart));
        setEndDate(formatDateString(nextWeekEnd));
        break;
      case 'custom':
        // Keep current dates
        break;
      default:
        break;
    }
  };

  const handleDownload = () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert('Start date must be before or equal to end date');
      return;
    }

    onDownload({
      start: formatDateString(start),
      end: formatDateString(end),
      label: getDateRangeLabel(start, end)
    });
    
    onClose();
  };

  const getDateRangeLabel = (start, end) => {
    if (formatDateString(start) === formatDateString(end)) {
      return formatDisplayDate(start);
    }
    return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`;
  };

  const getPreviewInfo = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return {
      range: getDateRangeLabel(start, end),
      days: daysDiff,
      isValid: start <= end
    };
  };

  if (!isOpen) return null;

  const previewInfo = getPreviewInfo();

  return (
    <div className="delete-modal">
      <div className="delete-content" style={{ maxWidth: '450px' }}>
        <h3>📋 Download Grocery List</h3>
        
        <p style={{ margin: '0 0 1.5rem 0', color: '#666' }}>
          Select the date range for your grocery list:
        </p>

        {/* Quick Options */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold' }}>
            Quick Options:
          </h4>
          
          {[
            { value: 'today', label: '📅 Today Only', icon: '🎯' },
            { value: 'current-week', label: '📅 Current Week', icon: '📊' },
            { value: 'next-week', label: '📅 Next Week', icon: '⏭️' },
            { value: 'custom', label: '📅 Custom Range', icon: '🔧' }
          ].map(option => (
            <label key={option.value} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              margin: '0.5rem 0',
              border: '2px solid',
              borderColor: selectedOption === option.value ? '#4a90e2' : '#ddd',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              backgroundColor: selectedOption === option.value ? '#f0f8ff' : 'white',
              transition: 'all 0.2s ease'
            }}>
              <input
                type="radio"
                name="dateOption"
                value={option.value}
                checked={selectedOption === option.value}
                onChange={(e) => handleOptionChange(e.target.value)}
                style={{ marginRight: '0.75rem' }}
              />
              <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>
                {option.icon}
              </span>
              <span style={{ 
                fontSize: '0.95rem',
                fontWeight: selectedOption === option.value ? 'bold' : 'normal'
              }}>
                {option.label.replace('📅 ', '')}
              </span>
            </label>
          ))}
        </div>

        {/* Custom Date Range */}
        {selectedOption === 'custom' && (
          <div style={{ 
            marginBottom: '1.5rem',
            padding: '1rem',
            background: '#f9f9f9',
            borderRadius: '0.5rem',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>
              🔧 Custom Date Range:
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  Start Date:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5rem', 
                  fontSize: '0.9rem',
                  fontWeight: 'bold'
                }}>
                  End Date:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #ddd',
                    fontSize: '0.9rem'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Preview */}
        <div style={{ 
          marginBottom: '2rem',
          padding: '1rem',
          background: previewInfo.isValid ? '#f0f8ff' : '#fff3f3',
          borderRadius: '0.5rem',
          border: `2px solid ${previewInfo.isValid ? '#4a90e2' : '#ff6b6b'}`
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 'bold' }}>
            📋 Preview:
          </h4>
          
          {previewInfo.isValid ? (
            <>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Date Range:</strong> {previewInfo.range}
              </p>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                <strong>Duration:</strong> {previewInfo.days} day{previewInfo.days !== 1 ? 's' : ''}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.8rem', color: '#666' }}>
                💡 This will include all meals scheduled within this date range.
              </p>
            </>
          ) : (
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#d32f2f' }}>
              ❌ Invalid date range. Start date must be before or equal to end date.
            </p>
          )}
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
            onClick={handleDownload}
            disabled={!previewInfo.isValid}
            style={{
              background: previewInfo.isValid ? '#4a90e2' : '#ccc',
              color: 'white',
              border: `2px solid ${previewInfo.isValid ? '#4a90e2' : '#ccc'}`,
              fontWeight: 'bold',
              cursor: previewInfo.isValid ? 'pointer' : 'not-allowed'
            }}
          >
            📥 Download List
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryDownloadModal;