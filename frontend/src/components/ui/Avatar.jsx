import React from 'react';

/**
 * Avatar component — shows image or generated initials fallback
 * @param {string} src - image URL
 * @param {string} name - user's name for initials
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size - avatar size
 * @param {string} className - extra CSS class
 */
const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={name} onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <span>{initials || '?'}</span>
      )}
    </div>
  );
};

export default Avatar;
