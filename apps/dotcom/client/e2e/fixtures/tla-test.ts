import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test as base, expect } from '@playwright/test'
import fs from 'fs'
import { OTHER_USERS, USERS } from '../consts'
import { Database } from './Database'
import { DeleteFileDialog } from './DeleteFileDialog'
import { Editor } from './Editor'
import { HomePage } from './HomePage'
import { ShareMenu } from './ShareMenu'
import { Sidebar } from './Sidebar'
import { getStorageStateFileName } from './helpers'

interface TlaFixtures {
	homePage: HomePage
	editor: Editor
	sidebar: Sidebar
	shareMenu: ShareMenu
	database: Database
	deleteFileDialog: DeleteFileDialog
	setupAndCleanup: void
}

interface TlaWorkerFixtures {
	workerStorageState: string
}

export const test = base.extend<TlaFixtures, TlaWorkerFixtures>({
	sidebar: async ({ page }, testUse) => {
		await testUse(new Sidebar(page))
	},
	editor: async ({ page, sidebar }, testUse) => {
		await testUse(new Editor(page, sidebar))
	},
	homePage: async ({ page, editor }, testUse) => {
		await testUse(new HomePage(page, editor))
	},
	database: async ({ page }, testUse) => {
		await testUse(new Database(page, test.info().parallelIndex))
	},
	shareMenu: async ({ page }, testUse) => {
		await testUse(new ShareMenu(page))
	},
	deleteFileDialog: async ({ page }, testUse) => {
		await testUse(new DeleteFileDialog(page))
	},
	// This is an auto fixture which makes sure that we are on the home page when the test starts
	// and that we clean up when the tests completes
	setupAndCleanup: [
		async ({ page, homePage, database }, testUse) => {
			// All the code before testUse is run before each test

			// Make sure we don't get marked as a bot
			// https://clerk.com/docs/testing/playwright/overview
			await setupClerkTestingToken({ page })

			await homePage.goto()
			await homePage.isLoaded()

			await testUse()

			// All the code after testUse is run after each test
			await database.reset()
		},
		{ auto: true },
	],
	storageState: ({ workerStorageState }, testUse) => testUse(workerStorageState),
	workerStorageState: [
		async ({ browser }, testUse) => {
			const id = test.info().parallelIndex

			const fileName = getStorageStateFileName(id, 'huppy')
			if (fs.existsSync(fileName)) {
				// Reuse existing authentication state if any.
				await testUse(fileName)
				return
			}
			for (const user of ['huppy' as const, 'suppy' as const]) {
				const fileName = getStorageStateFileName(id, user)
				// Important: make sure we authenticate in a clean environment by unsetting storage state.
				const page = await browser.newPage({ storageState: undefined })
				let email: string
				if (user === 'huppy') {
					email = USERS[id]
				} else {
					email = OTHER_USERS[id]
				}
				const sidebar = new Sidebar(page)
				const editor = new Editor(page, sidebar)
				const homePage = new HomePage(page, editor)
				await homePage.loginAs(email)
				await expect(page.getByTestId('tla-sidebar-layout')).toBeVisible()

				await page.context().storageState({ path: fileName })
				await page.close()
			}
			await testUse(fileName)
		},
		{ scope: 'worker' },
	],
})

export { expect } from '@playwright/test'
