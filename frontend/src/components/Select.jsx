import { useState } from 'react';
import Icon from './Icon';

export default function Select({ children, style: extraStyle, ...rest }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative', ...extraStyle }}>
      <select
        {...rest}
        onFocus={e => { setFocused(true); rest.onFocus?.(e); }}
        onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
        style={{
          height: 40, padding: '0 36px 0 12px', width: '100%',
          border: `1px solid ${focused ? '#1A3A5C' : '#E5E7EB'}`,
          borderRadius: 8, fontSize: 14, fontFamily: 'inherit',
          background: '#fff', color: '#111827', outline: 'none',
          appearance: 'none', cursor: 'pointer',
          boxShadow: focused ? '0 0 0 3px rgba(26,58,92,.2)' : 'none',
          transition: 'border-color 150ms, box-shadow 150ms',
        }}
      >
        {children}
      </select>
      <Icon name="chevDown" size={16} style={{ position: 'absolute', right: 12, top: 12, color: '#6B7280', pointerEvents: 'none' }} />
    </div>
  );
}
