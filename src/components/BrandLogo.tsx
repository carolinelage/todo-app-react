import Link from 'next/link';

type BrandLogoProps = {
  className?: string;
  href?: string;
};

export default function BrandLogo({ className = '', href }: BrandLogoProps) {
  const logo = <span className={`brand-logo ${className}`} role="img" aria-label="starTodo" />;

  return href ? <Link href={href} className="brand-logo-link">{logo}</Link> : logo;
}
