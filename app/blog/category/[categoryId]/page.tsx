import { categories, articles } from '../../_assets/content';
import CardArticle from '../../_assets/components/CardArticle';
import { getSEOTags } from '@/libs/seo';
import config from '@/config';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { categoryId: string };
}): Promise<Metadata> {
  const category = categories.find(category => category.slug === params.categoryId);

  if (!category) {
    return getSEOTags({
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
      canonicalUrlRelative: `/blog/category/${params.categoryId}`,
    });
  }

  return getSEOTags({
    title: `${category.title} | Blog by ${config.appName}`,
    description: category.description,
    canonicalUrlRelative: `/blog/category/${category.slug}`,
  });
}

export default async function Category({ params }: { params: { categoryId: string } }) {
  const category = categories.find(category => category.slug === params.categoryId);

  if (!category) {
    notFound();
  }

  const articlesInCategory = articles
    .filter(article => article.categories.map(c => c.slug).includes(category.slug))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <>
      <section className="mt-12 mb-24 md:mb-32 max-w-3xl mx-auto text-center">
        <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-6 md:mb-12">
          {category.title}
        </h1>
        <p className="md:text-lg opacity-80 max-w-xl mx-auto">{category.description}</p>
      </section>

      <section className="grid lg:grid-cols-2 gap-8 mb-24 md:mb-32">
        {articlesInCategory.map(article => (
          <CardArticle article={article} key={article.slug} />
        ))}
      </section>
    </>
  );
}
