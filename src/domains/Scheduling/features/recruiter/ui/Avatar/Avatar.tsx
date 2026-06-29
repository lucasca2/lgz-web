import styles from "./Avatar.module.css";

type AvatarProps = {
  email: string;
  name?: string;
  picture?: string | null;
  className?: string;
};

// Iniciais a partir do nome (duas palavras) ou do e-mail.
function initials(name: string | undefined, email: string): string {
  const base = name?.trim() || email.split("@")[0] || email;
  const parts = base.split(/[\s._-]+/).filter(Boolean);
  const chars =
    parts.length >= 2
      ? `${parts[0][0]}${parts[1][0]}`
      : base.slice(0, 2);
  return chars.toUpperCase();
}

// Foto do Google quando houver; senão, círculo com iniciais.
export function Avatar({ email, name, picture, className }: AvatarProps) {
  const classes = [styles.avatar, className].filter(Boolean).join(" ");

  if (picture) {
    return (
      <img
        className={classes}
        src={picture}
        alt=""
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    );
  }

  return (
    <span className={classes} aria-hidden="true">
      {initials(name, email)}
    </span>
  );
}
