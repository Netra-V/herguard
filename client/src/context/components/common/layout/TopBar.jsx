import useAuth from "../../../hooks/useAuth";

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <button type="button" className="menu-toggle" onClick={onMenuClick}>☰</button>
      <div className="topbar-search">
        <input type="search" placeholder="Search features..." />
      </div>
      <div className="topbar-actions">
        <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>{user?.email}</span>
        <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '.8rem' }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}