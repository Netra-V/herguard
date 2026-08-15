export default function Card({ children, className = '', style }) {
  return (
    <div className={`glass glass-card ${className}`} style={style}>
      {children}
    </div>
  );
}