import Icon from './Icon';

const VARIANTS = {
  primary:   { background: '#1A3A5C', color: '#fff', borderColor: 'transparent' },
  secondary: { background: '#fff', color: '#1A3A5C', borderColor: '#E5E7EB' },
  ghost:     { background: 'transparent', color: '#374151', borderColor: 'transparent' },
  danger:    { background: '#DC2626', color: '#fff', borderColor: 'transparent' },
  link:      { background: 'transparent', color: '#1A3A5C', borderColor: 'transparent', padding: 0, height: 'auto' },
};

const HOVERS = {
  primary: '#15314D', secondary: '#F3F4F6', ghost: '#F3F4F6', danger: '#B91C1C',
};

const SIZES = {
  sm: { height: 32, padding: '0 12px', fontSize: 13 },
  md: { height: 40, padding: '0 16px', fontSize: 14 },
  lg: { height: 44, padding: '0 20px', fontSize: 15 },
};

export default function Button({
  variant = 'primary', size = 'md', icon, iconRight, children,
  onClick, type = 'button', disabled, style: extraStyle = {},
}) {
  const v = VARIANTS[variant];
  const s = SIZES[size];

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, borderRadius: 6, fontFamily: 'inherit', fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: `1px solid ${v.borderColor}`, transition: 'all 150ms ease-out',
        opacity: disabled ? 0.5 : 1, lineHeight: 1, whiteSpace: 'nowrap',
        background: v.background, color: v.color,
        ...s, ...extraStyle,
      }}
      onMouseEnter={e => { if (!disabled && HOVERS[variant]) e.currentTarget.style.background = HOVERS[variant]; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.background; }}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}
