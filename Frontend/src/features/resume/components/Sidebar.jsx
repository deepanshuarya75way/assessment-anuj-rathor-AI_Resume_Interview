export default function Sidebar({
  title,
  subtitle,
  label,
  avatar,
  items = [],
  assist,
  bottomLinks = [],
  variant = "editor",
}) {
  return (
    <aside className={`resume-sidebar resume-sidebar--${variant}`}>

      <div className="resume-sidebar__profile">
        {avatar && <img src={avatar} alt="" />}
        <div>
          <div>{title}</div>
          <div>{subtitle}</div>
        </div>
      </div>

      <div>
        {items.map((item) => (
          <button key={item.key}>
            {item.label}
          </button>
        ))}
      </div>

    </aside>
  );
}