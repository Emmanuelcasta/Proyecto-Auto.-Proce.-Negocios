export default function Card({ children, padding = 24, style }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
      boxShadow: '0 1px 2px rgba(17,24,39,.06)', padding, ...style,
    }}>
      {children}
    </div>
  );
}
