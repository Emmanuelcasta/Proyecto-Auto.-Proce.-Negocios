const BG = ['#1A3A5C', '#2C5F8D', '#4A86B8', '#15314D'];

export default function Avatar({ name = '', size = 32 }) {
  const initials = name.split(' ').map(s => s[0]).filter(Boolean).slice(0, 2).join('');
  const idx = ((name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0)) % BG.length;
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: BG[idx], color: '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size <= 28 ? 11 : 13, fontWeight: 600,
    }}>
      {initials}
    </span>
  );
}
