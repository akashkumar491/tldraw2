import { Content } from '@/components/content'
import { Footer } from '@/components/docs/footer'
import { Header } from '@/components/docs/header'
import { TableOfContents } from '@/components/docs/table-of-contents'
import { MobileSidebar } from '@/components/navigation/mobile-sidebar'
import { Sidebar } from '@/components/sidebar'
import { getPageContent } from '@/utils/get-page-content'
import { notFound } from 'next/navigation'

export default async function Page({ params }: { params: { slug: string | string[] } }) {
	const path = typeof params.slug === 'string' ? [params.slug] : params.slug
	const content = await getPageContent(`/${path.join('/')}`)
	if (!content || content.type !== 'article') notFound()

	return (
		<div className="w-full max-w-screen-xl mx-auto md:px-5 md:flex md:pt-16">
			<Sidebar
				sectionId={content.article.sectionId}
				categoryId={content.article.categoryId}
				articleId={content.article.id}
			/>
			<div className="fixed w-full h-12 border-b border-zinc-100 flex items-center justify-between px-5 bg-white/90 backdrop-blur z-10">
				<MobileSidebar
					sectionId={content.article.sectionId}
					categoryId={content.article.categoryId}
					articleId={content.article.id}
				/>
			</div>
			<main className="w-full max-w-3xl px-5 lg:px-12 pt-24 md:pt-0">
				<Header article={content.article} />
				<Content mdx={content.article.content ?? ''} />
				<Footer article={content.article} />
			</main>
			<TableOfContents article={content.article} />
		</div>
	)
}
