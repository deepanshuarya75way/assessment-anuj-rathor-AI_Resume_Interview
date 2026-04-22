import ResumeIcon from "./ResumeIcon";

export default function SocialLinks({ items = [] }) {
  return (
    <div className="resume-social-links">
      {items.map((item) => (
        <div className="resume-social-links__item" key={item.label}>
          <ResumeIcon name={item.icon} size={16} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
