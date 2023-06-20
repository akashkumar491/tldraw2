import { Breadcrumb } from '@/components/Breadcrumb'
import { Mdx } from '@/components/Mdx'
import { MetaHead } from '@/components/MetaHead'
import { Sidebar } from '@/components/Sidebar'
import ArticlePage from '@/pages/[sectionId]/[childId]/[articleId]'
import { Article, Category, Section, SidebarContentList } from '@/types/content-types'
import {
	getArticle,
	getArticleSource,
	getArticles,
	getCategory,
	getLinks,
	getSection,
	getSections,
} from '@/utils/content'
import { getSidebarContentList } from '@/utils/getSidebarContentList'
import { GetStaticPaths, GetStaticProps } from 'next'
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { ArticleProps } from './[articleId]'

type CategoryProps = {
	type: 'category'
	sidebar: SidebarContentList
	section: Section
	category: Category
	articles: Article[]
	mdxSource: MDXRemoteSerializeResult | null
}

type ChildProps = CategoryProps | ArticleProps

export default function CategoryListPage(props: ChildProps) {
	const theme = useTheme()

	if (props.type === 'article') {
		return <ArticlePage {...props} />
	}

	const { sidebar, section, category, articles, mdxSource } = props

	const ungrouped: Article[] = []
	const groupedArticles = Object.fromEntries(
		category.groups.map((group) => [group.id, { group, articles: [] as Article[] }])
	)

	for (const article of articles) {
		if (article.groupId) {
			if (groupedArticles[article.groupId]) {
				groupedArticles[article.groupId].articles.push(article)
			} else {
				throw Error(
					`Article ${article.id} has groupId ${article.groupId} but no such group exists.`
				)
			}
		} else {
			ungrouped.push(article)
		}
	}

	return (
		<>
			<MetaHead title={category.title} description={category.description} />
			<div className="layout">
				<Sidebar {...sidebar} />
				<main className={`article list ${theme.theme ?? 'light'}`}>
					<Breadcrumb section={section} />
					<h1>{category.title}</h1>
					{mdxSource && <Mdx mdxSource={mdxSource} />}
					{Object.values(groupedArticles)
						.filter((g) => g.articles.length > 0)
						.map(({ group, articles }) => (
							<>
								<h2>{group.title}</h2>
								<ul>
									{articles.map((article) => (
										<Link key={article.id} href={`/${section.id}/${category.id}/${article.id}`}>
											<li>{article.title}</li>
										</Link>
									))}
								</ul>
							</>
						))}
					{ungrouped.length > 0 ? (
						<ul>
							{ungrouped.map((article) => (
								<Link key={article.id} href={`/${section.id}/${category.id}/${article.id}`}>
									<li>{article.title}</li>
								</Link>
							))}
						</ul>
					) : null}
				</main>
			</div>
		</>
	)
}

export const getStaticPaths: GetStaticPaths = async () => {
	const sections = await getSections()
	const paths: { params: { sectionId: string; childId: string } }[] = []

	for (const section of sections) {
		if (section.categories) {
			for (const category of section.categories) {
				paths.push({ params: { sectionId: section.id, childId: category.id } })

				// Add paths for uncategorized articles as well
				if (category.id !== 'ucg') continue
				for (const articleId of category.articleIds) {
					paths.push({ params: { sectionId: section.id, childId: articleId } })
				}
			}
		}
	}

	return { paths, fallback: false }
}

export const getStaticProps: GetStaticProps<ChildProps> = async (ctx) => {
	const sectionId = ctx.params?.sectionId?.toString() as string
	const childId = ctx.params?.childId?.toString()
	if (!childId || !sectionId) throw Error()

	const articles = await getArticles()
	const section = await getSection(sectionId)

	// If the path goes to an uncategorized article, show the article page
	if (!section.categories.some((c) => c.id === childId)) {
		const categoryId = 'ucg'
		const articleId = childId
		const sidebar = await getSidebarContentList({ sectionId, categoryId, articleId })
		const category = await getCategory(sectionId, categoryId)
		const article = await getArticle(articleId)
		const links = await getLinks(articleId)
		const mdxSource = await getArticleSource(articleId)
		return {
			props: {
				type: 'article',
				sidebar,
				section,
				category,
				article,
				links,
				mdxSource,
			},
		}
	}

	// Otherwise, show the category page
	const categoryId = childId
	const sidebar = await getSidebarContentList({ sectionId, categoryId })
	const category = await getCategory(sectionId, categoryId)
	const categoryArticles = category.articleIds.map((id) => articles[id])

	const article = articles[categoryId + '_index'] ?? null
	const mdxSource = article ? await getArticleSource(categoryId + '_index') : null

	return {
		props: {
			type: 'category',
			sidebar,
			section,
			category,
			articles: categoryArticles,
			mdxSource,
		},
	}
}
