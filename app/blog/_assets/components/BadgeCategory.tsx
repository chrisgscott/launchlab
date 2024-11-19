import React from 'react';
import Link from 'next/link';
import type { categoryType } from '../content';

interface BadgeCategoryProps {
  category: categoryType;
  size?: 'sm' | 'md' | 'lg';
}

const BadgeCategory: React.FC<BadgeCategoryProps> = ({ category, size = 'md' }) => {
  if (!category) {
    return null;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  return (
    <Link
      href={`/blog/category/${category.slug}`}
      title={`View all ${category.title} posts`}
      className={`badge badge-outline hover:badge-primary ${sizeClasses[size]}`}
    >
      {category.titleShort || category.title}
    </Link>
  );
};

export default BadgeCategory;
