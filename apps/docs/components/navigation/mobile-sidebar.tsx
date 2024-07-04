import { getDb } from '@/utils/ContentDatabase'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { Bars3Icon } from '@heroicons/react/16/solid'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { CategoryMenu } from './category-menu'
import { SidebarMenu } from './sidebar-menu'

export const MobileSidebar: React.FC<{
	sectionId?: string
	categoryId?: string
	articleId?: string
}> = async ({ sectionId, categoryId, articleId }) => {
	const db = await getDb()
	const sidebar = await db.getSidebarContentList({ sectionId, categoryId, articleId })
	const skipFirstLevel = ['reference', 'examples'].includes(sectionId ?? '')
	// @ts-ignore
	const elements = skipFirstLevel ? sidebar.links[0].children : sidebar.links

	return (
		<Popover className="group/popover h-full grow">
			<PopoverButton className="group/button focus:outline-none h-full w-full flex justify-start items-center">
				<div className="flex gap-2 h-8 px-2 -ml-2 items-center justify-center rounded group-focus/button:outline-none group-focus/button:bg-zinc-100 text-black font-semibold">
					<Bars3Icon className="h-4 shrink-0 group-data-[open]/popover:hidden" />
					<XMarkIcon className="h-4 scale-125 shrink-0 hidden group-data-[open]/popover:block" />
					<span className="text-sm">Menu</span>
				</div>
			</PopoverButton>
			<PopoverPanel>
				<div
					className="fixed left-0 top-12 bg-white w-screen px-5 py-8 overflow-y-auto"
					style={{ height: 'calc(100vh - 6.5rem)' }}
				>
					<CategoryMenu />
					{elements.map((menu: any, index: number) => (
						// @ts-ignore
						<SidebarMenu key={index} title={menu.title} elements={menu.children} />
					))}
				</div>
			</PopoverPanel>
		</Popover>
	)
}
