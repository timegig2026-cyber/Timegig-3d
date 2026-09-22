import React from 'react';

interface RealisticIconProps {
  className?: string;
  isActive?: boolean;
}

/**
 * Realistic Seekers Icon:
 * Vibrant multi-tone Sapphire & Azure gradient with realistic specular depth and drop shadow.
 */
export const RealisticSeekersIcon: React.FC<RealisticIconProps> = ({
  className = 'w-6 h-6',
  isActive = false,
}) => {
  const filterId = 'seekers-shadow';
  const gradId = 'seekers-gradient';
  const glowGradId = 'seekers-glow';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-all duration-200"
        style={{
          filter: isActive
            ? 'drop-shadow(0 3px 6px rgba(14, 116, 144, 0.45)) drop-shadow(0 1px 2px rgba(2, 132, 199, 0.3))'
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
          opacity: isActive ? 1 : 0.65,
          transform: isActive ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="45%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id={glowGradId} x1="8" y1="4" x2="24" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#BAE6FD" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0284C7" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="seekers-sec" x1="16" y1="6" x2="28" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>

        {/* Realistic layered group icon (Primary Seeker & Secondary Seekers) */}
        {/* Secondary Left Seeker */}
        <ellipse cx="9" cy="11" rx="3" ry="3.2" fill="url(#seekers-sec)" opacity="0.9" />
        <path
          d="M3 24.5C3 20.8 5.8 18 9.5 18C12 18 14.1 19.3 15.2 21.3C13.8 22.8 13 24.8 13 27H4.5C3.7 27 3 25.9 3 24.5Z"
          fill="url(#seekers-sec)"
          opacity="0.85"
        />

        {/* Secondary Right Seeker */}
        <ellipse cx="23" cy="11" rx="3" ry="3.2" fill="url(#seekers-sec)" opacity="0.9" />
        <path
          d="M29 24.5C29 20.8 26.2 18 22.5 18C20 18 17.9 19.3 16.8 21.3C18.2 22.8 19 24.8 19 27H27.5C28.3 27 29 25.9 29 24.5Z"
          fill="url(#seekers-sec)"
          opacity="0.85"
        />

        {/* Primary Central Seeker with realistic depth & highlights */}
        <ellipse cx="16" cy="9.5" rx="4.5" ry="4.8" fill={`url(#${gradId})`} />
        {/* Highlight on head */}
        <ellipse cx="14.5" cy="8" rx="2" ry="1.4" fill="#FFFFFF" fillOpacity="0.55" />

        {/* Central Seeker Body / Torso */}
        <path
          d="M8 27C8 21.8 11.5 17.5 16 17.5C20.5 17.5 24 21.8 24 27C24 27.8 23.4 28.5 22.5 28.5H9.5C8.7 28.5 8 27.8 8 27Z"
          fill={`url(#${gradId})`}
        />

        {/* Specular gloss streak */}
        <path
          d="M10 26.5C10.5 22.5 13 19 16 19C16.8 19 17.6 19.3 18.3 19.7C15 20.5 12.5 23 12 26.5H10Z"
          fill="#FFFFFF"
          fillOpacity="0.4"
        />
      </svg>
    </div>
  );
};

/**
 * Realistic GiGs Icon:
 * Rich warm Cognac/Amber leather briefcase with realistic gold hardware and dimensional shadows.
 */
export const RealisticGigsIcon: React.FC<RealisticIconProps> = ({
  className = 'w-6 h-6',
  isActive = false,
}) => {
  const gradId = 'gigs-leather';
  const handleGradId = 'gigs-handle';
  const goldGradId = 'gigs-gold';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-all duration-200"
        style={{
          filter: isActive
            ? 'drop-shadow(0 3px 6px rgba(217, 119, 6, 0.45)) drop-shadow(0 1px 2px rgba(180, 83, 9, 0.35))'
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
          opacity: isActive ? 1 : 0.65,
          transform: isActive ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <defs>
          {/* Rich leather gradient */}
          <linearGradient id={gradId} x1="4" y1="9" x2="28" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="40%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Handle gradient */}
          <linearGradient id={handleGradId} x1="11" y1="3" x2="21" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Gold metallic hardware gradient */}
          <linearGradient id={goldGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="40%" stopColor="#FACC15" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
        </defs>

        {/* Handle */}
        <path
          d="M11.5 9V6C11.5 4.6 12.6 3.5 14 3.5H18C19.4 3.5 20.5 4.6 20.5 6V9"
          stroke={`url(#${handleGradId})`}
          strokeWidth="2.25"
          strokeLinecap="round"
        />

        {/* Briefcase Main Body */}
        <rect
          x="3.5"
          y="9"
          width="25"
          height="19"
          rx="3.5"
          fill={`url(#${gradId})`}
        />

        {/* Briefcase Flap / Upper Fold */}
        <path
          d="M3.5 12.5C3.5 10.5 5.1 9 7 9H25C26.9 9 28.5 10.5 28.5 12.5V17C28.5 17 22 19 16 19C10 19 3.5 17 3.5 17V12.5Z"
          fill="#B45309"
          fillOpacity="0.45"
        />

        {/* Top Rim Highlight */}
        <rect
          x="4.5"
          y="10"
          width="23"
          height="1"
          rx="0.5"
          fill="#FDE68A"
          fillOpacity="0.75"
        />

        {/* Leather Straps / Stitching Accents */}
        <rect x="8" y="9" width="2" height="19" fill="#78350F" fillOpacity="0.35" />
        <rect x="22" y="9" width="2" height="19" fill="#78350F" fillOpacity="0.35" />

        {/* Gold Clasp & Lock Details */}
        <rect
          x="14"
          y="16.5"
          width="4"
          height="5"
          rx="1"
          fill={`url(#${goldGradId})`}
          stroke="#78350F"
          strokeWidth="0.5"
        />
        <circle cx="16" cy="18.5" r="0.8" fill="#451A03" />

        {/* Buckles */}
        <rect x="7.5" y="16" width="3" height="2" rx="0.5" fill={`url(#${goldGradId})`} />
        <rect x="21.5" y="16" width="3" height="2" rx="0.5" fill={`url(#${goldGradId})`} />
      </svg>
    </div>
  );
};

/**
 * Realistic Profile Icon:
 * Royal Amethyst & Violet user avatar with realistic glossy depth and studio lighting reflection.
 */
export const RealisticProfileIcon: React.FC<RealisticIconProps> = ({
  className = 'w-6 h-6',
  isActive = false,
}) => {
  const gradId = 'profile-royal';
  const badgeGradId = 'profile-badge';

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-all duration-200"
        style={{
          filter: isActive
            ? 'drop-shadow(0 3px 6px rgba(124, 58, 237, 0.45)) drop-shadow(0 1px 2px rgba(91, 33, 182, 0.35))'
            : 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
          opacity: isActive ? 1 : 0.65,
          transform: isActive ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        <defs>
          <linearGradient id={gradId} x1="6" y1="3" x2="26" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="45%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>

          <linearGradient id={badgeGradId} x1="16" y1="3" x2="16" y2="29" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F3E8FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Outer Circular Glow Badge */}
        <circle cx="16" cy="16" r="13.5" fill={`url(#${gradId})`} />

        {/* Beveled Top Highlight Arc */}
        <path
          d="M5 16C5 9.9 9.9 5 16 5C22.1 5 27 9.9 27 16"
          stroke="#E9D5FF"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />

        {/* Head */}
        <circle cx="16" cy="12" r="4.5" fill="#FFFFFF" />
        {/* Soft face contour */}
        <circle cx="15.2" cy="11" r="1.5" fill="#DDD6FE" fillOpacity="0.8" />

        {/* Torso / Shoulders with smooth curve inside badge */}
        <path
          d="M8.5 25C9.2 20.8 12.2 18.5 16 18.5C19.8 18.5 22.8 20.8 23.5 25C21.5 27.5 18.9 28.5 16 28.5C13.1 28.5 10.5 27.5 8.5 25Z"
          fill="#FFFFFF"
        />

        {/* Subtle glossy reflection over the badge */}
        <ellipse cx="16" cy="7" rx="6" ry="2" fill="#FFFFFF" fillOpacity="0.3" />
      </svg>
    </div>
  );
};

/**
 * Realistic Admin Feature Icon:
 * Royal Golden Shield with Ruby Emblem, metallic bevels, and realistic radiance.
 */
export const RealisticAdminIcon: React.FC<{
  className?: string;
  onClick?: () => void;
}> = ({ className = 'w-7 h-7', onClick }) => {
  return (
    <button
      id="btn-admin-feature"
      type="button"
      onClick={onClick}
      aria-label="Admin Feature"
      className={`relative group p-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center ${className}`}
      title="Admin Features"
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible transition-transform duration-200"
        style={{
          filter:
            'drop-shadow(0 3px 6px rgba(220, 38, 38, 0.4)) drop-shadow(0 1px 3px rgba(202, 138, 4, 0.45))',
        }}
      >
        <defs>
          {/* Metallic Gold Shield Gradient */}
          <linearGradient id="admin-gold" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#F59E0B" />
            <stop offset="65%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>

          {/* Crimson / Ruby Crest Gradient */}
          <linearGradient id="admin-ruby" x1="16" y1="7" x2="16" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Crown / Star Gold */}
          <linearGradient id="admin-crown-gold" x1="10" y1="9" x2="22" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Outer Shield Frame */}
        <path
          d="M16 3L6 7V15C6 21.5 10.3 27.5 16 29C21.7 27.5 26 21.5 26 15V7L16 3Z"
          fill="url(#admin-gold)"
        />

        {/* Shield Outer Highlight Bevel */}
        <path
          d="M16 4.2L7.5 7.6V15C7.5 18 9 22 16 27.5C23 22 24.5 18 24.5 15V7.6L16 4.2Z"
          stroke="#FEF9C3"
          strokeWidth="0.8"
          strokeOpacity="0.9"
        />

        {/* Inner Ruby Inlay */}
        <path
          d="M16 5.8L8.5 8.8V15C8.5 20.2 11.8 25 16 26.5C20.2 25 23.5 20.2 23.5 15V8.8L16 5.8Z"
          fill="url(#admin-ruby)"
        />

        {/* Metallic Crown / Admin Emblem */}
        <path
          d="M11 19L11.8 13.5L14 15.5L16 11.5L18 15.5L20.2 13.5L21 19H11Z"
          fill="url(#admin-crown-gold)"
          stroke="#78350F"
          strokeWidth="0.5"
        />

        {/* Admin Stars / Gems */}
        <circle cx="16" cy="11.5" r="0.9" fill="#FFFFFF" />
        <circle cx="11.8" cy="13.5" r="0.75" fill="#FEF08A" />
        <circle cx="20.2" cy="13.5" r="0.75" fill="#FEF08A" />

        {/* Emblem Baseline Bar */}
        <rect x="11" y="19" width="10" height="1.8" rx="0.6" fill="url(#admin-crown-gold)" />
      </svg>
    </button>
  );
};
