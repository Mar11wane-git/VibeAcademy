import React from 'react';

const VibeLogo = ({ size = 40, showText = true, showBadge = true, onClick, style = {} }) => {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.7rem',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Bespoke 3D Vector Emblem: Cyber Hexagon + Code Brackets + Glowing "V" + Academic Crown */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.3),
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.22) 0%, rgba(0, 209, 255, 0.16) 50%, rgba(236, 72, 153, 0.22) 100%)',
          border: '1px solid rgba(167, 139, 250, 0.45)',
          boxShadow: '0 8px 24px rgba(112, 0, 255, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
          flexShrink: 0,
        }}
      >
        <svg
          width={Math.round(size * 0.78)}
          height={Math.round(size * 0.78)}
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="vibeLogoPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d1ff" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="vibeLogoGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* Outer Hexagon Shield */}
          <polygon
            points="32,4 57,18 57,46 32,60 7,46 7,18"
            fill="rgba(10, 12, 28, 0.85)"
            stroke="url(#vibeLogoPrimary)"
            strokeWidth="3"
            strokeLinejoin="round"
          />

          {/* Top Academic Mortarboard / Diamond Spark */}
          <polygon
            points="32,10 42,15 32,20 22,15"
            fill="url(#vibeLogoGold)"
          />

          {/* Stylized "V" Wing Blades */}
          <path
            d="M18 23L32 49L46 23"
            stroke="url(#vibeLogoPrimary)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Cyber Core Dot */}
          <circle cx="32" cy="29" r="3.2" fill="#00d1ff" />
        </svg>
      </div>

      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              className="brand-font"
              style={{
                fontSize: size >= 40 ? '1.25rem' : '1.1rem',
                fontWeight: 900,
                letterSpacing: '-0.4px',
                background: 'linear-gradient(90deg, #ffffff 0%, #e2e8f0 55%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              MR1Academy
            </span>
            {showBadge && (
              <span
                style={{
                  fontSize: '0.6rem',
                  fontWeight: 900,
                  padding: '0.14rem 0.42rem',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #7000ff 0%, #00d1ff 100%)',
                  color: '#ffffff',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 10px rgba(112, 0, 255, 0.35)',
                }}
              >
                PRO
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.64rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.7px',
              textTransform: 'uppercase',
              marginTop: '2px',
            }}
          >
            AI • Data • Cloud • Code
          </span>
          <span
            style={{
              fontSize: '0.58rem',
              fontWeight: 800,
              color: '#00d1ff',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginTop: '1px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            PAR <span style={{ color: '#fff', textDecoration: 'underline decoration-cyan-400' }}>MAROUANE EL HAMDAOUI</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default VibeLogo;
