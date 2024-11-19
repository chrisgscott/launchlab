import Image from 'next/image';
import { authors, articles } from '../../_assets/content';
import CardArticle from '../../_assets/components/CardArticle';
import { getSEOTags } from '@/libs/seo';
import config from '@/config';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { authorId: string };
}): Promise<Metadata> {
  const author = authors.find(author => author.slug === params.authorId);

  if (!author) {
    return getSEOTags({
      title: 'Author Not Found',
      description: 'The requested author could not be found.',
      canonicalUrlRelative: `/blog/author/${params.authorId}`,
    });
  }

  return getSEOTags({
    title: `${author.name}, Author at ${config.appName}'s Blog`,
    description: `${author.description}`,
    canonicalUrlRelative: `/blog/author/${author.slug}`,
  });
}

export default async function Author({ params }: { params: { authorId: string } }) {
  const author = authors.find(author => author.slug === params.authorId);

  if (!author) {
    notFound();
  }

  const articlesByAuthor = articles
    .filter(article => article.author.slug === author.slug)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return (
    <>
      <section className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8 mt-12 mb-24 md:mb-32">
        <div>
          <p className="text-xs uppercase tracking-wide text-base-content/80 mb-2">Authors</p>
          <h1 className="font-extrabold text-3xl lg:text-5xl tracking-tight mb-2">{author.name}</h1>
          <p className="md:text-lg mb-6 md:mb-10 font-medium">{author.job}</p>
          <p className="md:text-lg text-base-content/80">{author.description}</p>
        </div>

        <div className="max-md:order-first flex md:flex-col gap-4 shrink-0">
          {author.avatar && (
            <Image
              src={author.avatar}
              alt={`Avatar of ${author.name}`}
              width={160}
              height={160}
              className="rounded-box object-cover"
            />
          )}
          {author.socials && author.socials.length > 0 && (
            <div className="flex md:justify-center gap-4">
              {author.socials.map(social => (
                <a
                  key={social.url}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-hover hover:link-primary"
                  title={`Follow ${author.name} on ${social.name}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-8 mb-24 md:mb-32">
        {articlesByAuthor.map(article => (
          <CardArticle article={article} key={article.slug} showCategory={true} />
        ))}
      </section>
    </>
  );
}
