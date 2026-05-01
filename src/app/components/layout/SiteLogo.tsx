type SiteLogoProps = {
  className?: string;
};

export default function SiteLogo({ className = 'w-16 h-16' }: SiteLogoProps) {
  return (
    <svg viewBox="0 0 520 520" fill="none" className={className} aria-hidden="true">
      <g transform="translate(20 20) scale(0.923)">
        <path
          d="M402 42H118C76.0264 42 42 76.0264 42 118V402C42 443.974 76.0264 478 118 478H402C443.974 478 478 443.974 478 402V118C478 76.0264 443.974 42 402 42Z"
          stroke="#F5F7FA"
          strokeWidth="28"
        />
        <path d="M150 160H335L170 360H335" stroke="#F5F7FA" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M380 160V360L250 235" stroke="#F5F7FA" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
