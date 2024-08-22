import { Aside } from '@/components/common/aside'
import { DocsArticleInfo } from '@/components/docs/docs-article-info'
import { DocsFeedbackWidget } from '@/components/docs/docs-feedback-widget'
import { HeadingsMenu } from '@/components/navigation/headings-menu'
import { Article } from '@/types/content-types'
import { getDb } from '@/utils/ContentDatabase'

export const DocsTableOfContents: React.FC<{ article: Article }> = async ({ article }) => {
	const db = await getDb()
	const headings = await db.getArticleHeadings(article.id)

	return (
		<Aside className="hidden xl:flex pl-12">
			<HeadingsMenu headings={headings} />
			<DocsArticleInfo article={article} />
			<DocsFeedbackWidget className="mb-12" />
		</Aside>
	)
}
