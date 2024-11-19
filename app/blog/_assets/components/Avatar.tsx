import React from 'react';
import Image from 'next/image';
import type { authorType } from '../content';

interface AvatarProps {
  author: authorType;
  size?: number;
}

const Avatar: React.FC<AvatarProps> = ({ author, size = 40 }) => {
  if (!author) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      {author.avatar && (
        <Image
          src={author.avatar}
          alt={`Avatar of ${author.name}`}
          width={size}
          height={size}
          className="rounded-full"
        />
      )}
      <div>
        <p className="font-medium">{author.name}</p>
        {author.job && <p className="text-base-content/80 text-sm">{author.job}</p>}
      </div>
    </div>
  );
};

export default Avatar;
