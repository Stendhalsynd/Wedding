type AuthorDisplay = {
  kind: 'image' | 'initial';
  label?: string;
  imageUrl?: string;
  name: string;
  initial: string;
};

export default function AuthorAvatar({
  display,
  size = 'md',
}: {
  display: AuthorDisplay;
  size?: 'sm' | 'md';
}) {
  const sizeClassName = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';

  if (display.kind === 'image' && display.imageUrl) {
    return (
      <div className={`${sizeClassName} rounded-full overflow-hidden border-2 border-white shadow-sm bg-white shrink-0`}>
        <img
          src={display.imageUrl}
          alt={display.label || display.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClassName} rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 shrink-0`}>
      {display.initial}
    </div>
  );
}
