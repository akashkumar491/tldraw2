import { test as base } from '@playwright/test'
import { StylePanel } from './stylepanel'
import { Toolbar } from './toolbar'

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
