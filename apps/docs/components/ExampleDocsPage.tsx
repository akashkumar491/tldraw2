import { Article } from '@/types/content-types'
import { getDb } from '@/utils/ContentDatabase'
import { ArticleNavLinks } from './ArticleNavLinks'
import { Breadcrumb } from './Breadcrumb'
import ExampleCodeBlock from './ExampleCodeBlock'
import { Header } from './Header'
import { Mdx } from './Mdx'
import { Sidebar } from './Sidebar'

export async function ExampleDocsPage({ article }: { article: Article }) {
	const db = await getDb()
	const section = await db.getSection(article.sectionId)
	const category = await db.getCategory(article.categoryId)
	const links = await db.getArticleLinks(article)
	const sidebar = await db.getSidebarContentList({
		sectionId: section.id,
		categoryId: category.id,
		articleId: article.id,
	})

	return (
		<>
			<Header sectionId={section.id} />
			<Sidebar {...sidebar} />
			<main className={`article article__example`}>
				<div className="page-header">
					<Breadcrumb section={section} category={category} />
					<h1>{article.title}</h1>
					{article.description && <p>{article.description}</p>}
				</div>
				{article.content && <Mdx content={article.content} />}
				<ExampleCodeBlock
					articleId={article.id}
					files={{
						'App.tsx': article.componentCode,
						...(article.componentCodeFiles ? JSON.parse(article.componentCodeFiles) : null),
					}}
					activeFile={'App.tsx'}
				/>
				{links && <ArticleNavLinks links={links} />}
			</main>
		</>
	)
}
