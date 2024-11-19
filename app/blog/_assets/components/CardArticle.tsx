import React from 'react';
import type { JSX } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import BadgeCategory from './BadgeCategory';
import Avatar from './Avatar';
import { articleType } from '../content';

interface CardArticleProps {
  article: articleType;
  tag?: keyof JSX.IntrinsicElements;
  showCategory?: boolean;
  isImagePriority?: boolean;
}

const CardArticle: React.FC<CardArticleProps> = ({
  article,
  tag = 'h2',
  showCategory = true,
  isImagePriority = false,
}) => {
  if (!article) {
    return null;
  }

  const TitleTag = tag;
  const formattedDate = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="card bg-base-200 rounded-box overflow-hidden">
      {article.image?.src && (
        <Link
          href={`/blog/${article.slug}`}
          className="link link-hover hover:link-primary"
          title={article.title}
          rel="bookmark"
        >
          <figure>
            <Image
              src={article.image.src}
              alt={article.image.alt}
              width={600}
              height={338}
              priority={isImagePriority}
              placeholder="blur"
              className="aspect-video object-center object-cover hover:scale-[1.03] duration-200 ease-in-out"
            />
          </figure>
        </Link>
      )}

      <div className="card-body">
        {/* CATEGORIES */}
        {showCategory && article.categories && article.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.categories.map(category => (
              <BadgeCategory category={category} key={category.slug} size="sm" />
            ))}
          </div>
        )}

        {/* TITLE */}
        <TitleTag className="card-title mb-4">
          <Link
            href={`/blog/${article.slug}`}
            className="link link-hover hover:link-primary"
            title={article.title}
            rel="bookmark"
          >
            {article.title}
          </Link>
        </TitleTag>

        {/* DESCRIPTION */}
        <p className="text-base-content/80 line-clamp-3">{article.description}</p>

        {/* METADATA */}
        <div className="flex items-center justify-between mt-6">
          {article.author && (
            <div className="flex items-center gap-4">
              <Avatar author={article.author} size={40} />
            </div>
          )}
          <time dateTime={article.publishedAt} className="text-base-content/60 text-sm">
            {formattedDate}
          </time>
        </div>
      </div>
    </article>
  );
};

export default CardArticle;
