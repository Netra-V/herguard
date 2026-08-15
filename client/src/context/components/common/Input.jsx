export default function Input({ label, required, className = '', ...props }) {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className={required ? 'required' : ''}>{label}</label>}
      <input {...props} />
    </div>
  );
}