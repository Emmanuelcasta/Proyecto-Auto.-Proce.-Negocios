import { useState } from 'react';
import Icon from './Icon';

function inputStyle(focused, error) {
  return {
    height: 40, padding: '0 12px',
    border: `1px solid ${error ? '#DC2626' : focused ? '#1A3A5C' : '#E5E7EB'}`,
    borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
    background: '#fff', color: '#111827', outline: 'none', width: '100%',
    boxShadow: focused ? '0 0 0 3px rgba(26,58,92,.2)' : 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  };
}

export default function Input({ icon, error, style: extraStyle, ...rest }) {
  const [focused, setFocused] = useState(false);

  if (icon) {
    return (
      <div style={{ position: 'relative' }}>
        <Icon name={icon} size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#6B7280' }} />
        <input
          {...rest}
          onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
          style={{ ...inputStyle(focused, error), paddingLeft: 36, ...extraStyle }}
        />
      </div>
    );
  }
  return (
    <input
      {...rest}
      onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
      onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
      style={{ ...inputStyle(focused, error), ...extraStyle }}
    />
  );
}
