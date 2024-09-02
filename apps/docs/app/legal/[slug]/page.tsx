import { PageTitle } from '@/components/common/page-title'
import { Content } from '@/components/content'
import { getPageContent } from '@/utils/get-page-content'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export async function generateMetadata({
	params,
}: {
	params: { slug: string }
}): Promise<Metadata> {
	const path = typeof params.slug === 'string' ? [params.slug] : params.slug
	const content = await getPageContent(`/legal/${path.join('/')}`)
	if (!content || content.type !== 'article' || content.article.sectionId !== 'legal') notFound()
	const metadata: Metadata = { title: content.article.title }
	if (content.article.description) metadata.description = content.article.description
	return metadata
}

export default async function Page({ params }: { params: { slug: string | string[] } }) {
	const path = typeof params.slug === 'string' ? [params.slug] : params.slug
	const content = await getPageContent(`/legal/${path.join('/')}`)
	if (!content || content.type !== 'article' || content.article.sectionId !== 'legal') notFound()

	return (
		<main className="w-full max-w-3xl mx-auto px-5 md:pr-0 lg:pl-12 xl:pr-12 py-24 md:pt-16">
			<div className="pb-6 mb-6 md:mb-12 md:pb-12 border-b border-zinc-100 dark:border-zinc-800">
				<PageTitle className="text-center">{content.article.title}</PageTitle>
			</div>
			<Content mdx={content.article.content ?? ''} type={content.article.sectionId} />
		</main>
	)
}
