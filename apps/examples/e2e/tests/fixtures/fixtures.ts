import { test as base } from '@playwright/test'
import { StylePanel } from './menus/StylePanel'
import { Toolbar } from './menus/Toolbar'

type Fixtures = {
	toolbar: Toolbar
	stylePanel: StylePanel
}

const test = base.extend<Fixtures>({
	toolbar: async ({ page }, use) => {
		const toolbar = new Toolbar(page)
		await use(toolbar)
	},
	stylePanel: async ({ page }, use) => {
		const stylePanel = new StylePanel(page)
		await use(stylePanel)
	},
})

export default test
