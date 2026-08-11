export default function Logo({ className = "h-10 w-auto", alt = "CareerVault AI", variant = "full" }) {
  const src =
    variant === "icon"
      ? `${process.env.PUBLIC_URL}/logo-icon.png`
      : `${process.env.PUBLIC_URL}/logo.png`;

  return <img src={src} alt={alt} className={className} />;
}
