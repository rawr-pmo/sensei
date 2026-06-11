import { Link } from 'react-router-dom';

const colorMap = {
  purple: 'bg-sensei-purple',
  orange: 'bg-sensei-orange',
  teal: 'bg-sensei-teal',
  pink: 'bg-sensei-pink',
  blue: 'bg-sensei-blue',
  green: 'bg-sensei-green'
};

export default function BigButton({ to, icon, title, subtitle, color = 'purple', onClick }) {
  const classes = `flex items-center gap-5 w-full p-6 rounded-3xl text-white shadow-lg active:scale-[0.98] transition transform ${colorMap[color]}`;

  const content = (
    <>
      <span className="text-4xl shrink-0" aria-hidden="true">{icon}</span>
      <span className="text-left">
        <span className="block text-xxl font-bold leading-tight">{title}</span>
        {subtitle && <span className="block text-base opacity-90 mt-1">{subtitle}</span>}
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {content}
    </button>
  );
}