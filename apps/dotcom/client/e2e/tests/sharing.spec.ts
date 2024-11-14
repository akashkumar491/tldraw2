import { Page } from '@playwright/test'
import fs from 'fs'
import path from 'path'
import { ShareMenu } from '../fixtures/ShareMenu'
import { openNewIncognitoPage } from '../fixtures/helpers'
import { expect, test } from '../fixtures/tla-test'

test.beforeEach(async ({ context }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write'])
})

/* --------------------- Sharing -------------------- */

async function shareFileAndCopyLink(
	page: Page,
	shareMenu: ShareMenu,
	shareAction: () => Promise<void>
) {
	await shareMenu.open()
	expect(await shareMenu.isVisible()).toBe(true)
	await shareAction()
	await shareMenu.copyLink()
	const handle = await page.evaluateHandle(() => navigator.clipboard.readText())
	return await handle.jsonValue()
}

const users = [
	{ user: undefined, sameFileName: false, description: 'anon users' },
	{ user: 'suppy' as const, sameFileName: true, description: 'logged in users' },
]

test.describe('shared files', () => {
	users.map((u) => {
		test(`can be seen by ${u.description}`, async ({ page, browser, shareMenu, editor }) => {
			const { url, fileName, userProps } = await test.step('Share file', async () => {
				const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.shareFile)
				const fileName = await editor.getCurrentFileName()
				const index = test.info().parallelIndex
				const userProps = u.user ? { user: u.user, index } : undefined
				return { url, fileName, userProps }
			})

			const { newContext, newPage, newEditor } =
				await test.step('open link in another window', async () =>
					openNewIncognitoPage(browser, {
						url,
						userProps,
					}))
			// We are in a multiplayer room with another person
			await expect(page.getByRole('button', { name: 'People' })).toBeVisible()

			await expect(newPage.getByRole('heading', { name: 'Not found' })).not.toBeVisible()
			expect(await newEditor.getCurrentFileName()).toBe(u.sameFileName ? fileName : 'New board')
			await newContext.close()
		})

		test(`can be unshared for ${u.description}`, async ({ page, browser, shareMenu }) => {
			const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.shareFile)

			const index = test.info().parallelIndex
			const userProps = u.user ? { user: u.user, index } : undefined
			const { newContext, errorPage } = await openNewIncognitoPage(browser, {
				url,
				userProps,
			})

			await shareMenu.unshareFile()
			await errorPage.expectPrivateFileVisible()
			await newContext.close()
		})
	})
	test('logged in users can copy shared links', async ({ page, browser, shareMenu }) => {
		const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.shareFile)
		const index = test.info().parallelIndex

		const { newPage, newShareMenu } = await openNewIncognitoPage(browser, {
			url,
			userProps: {
				user: 'huppy' as const,
				index,
			},
			allowClipboard: true,
		})
		// we have to wait a bit for the search params to get populated
		await newPage.waitForTimeout(500)
		const otherUserUrl = await newShareMenu.openMenuCopyLinkAndReturnUrl()
		expect(otherUserUrl).toBe(newPage.url())
	})

	test('anon users can copy shared links', async ({ page, browser, shareMenu }) => {
		const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.shareFile)

		const { newShareMenu } = await openNewIncognitoPage(browser, {
			url,
			allowClipboard: true,
			userProps: undefined,
		})
		await expect(newShareMenu.shareButton).not.toBeVisible()
	})
})

/* ------------------- Exporting ------------------- */
test('can export a file as an image', async ({ page, shareMenu }) => {
	await page.getByTestId('tools.rectangle').click()
	await page.locator('.tl-background').click()
	const downloadPromise = page.waitForEvent('download')

	await shareMenu.open()
	await shareMenu.exportFile()
	const download = await downloadPromise
	const suggestedFilename = download.suggestedFilename()
	expect(suggestedFilename).toMatch('file.png')
	const filePath = path.join('./test-results/', suggestedFilename)
	await download.saveAs(filePath)

	expect(fs.existsSync(filePath)).toBeTruthy()
	const stats = fs.statSync(filePath)
	expect(stats.size).toBeGreaterThan(0)
})

/* ------------------- Publishing ------------------- */

test.describe('published files', () => {
	users.map((u) => {
		test(`can be seen by ${u.description}`, async ({ page, browser, shareMenu }) => {
			const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.publishFile)
			expect(url).toMatch(/http:\/\/localhost:3000\/q\/p\//)

			const index = test.info().parallelIndex
			const userProps = u.user ? { user: u.user, index } : undefined

			const { newContext, newPage, newHomePage, errorPage } = await openNewIncognitoPage(browser, {
				url,
				userProps,
			})
			await errorPage.expectNotFoundNotVisible()
			if (!userProps) await newHomePage.expectSignInButtonVisible()
			// compare the urls without the search params
			expect(newPage.url().split('?')[0]).toBe(url.split('?')[0])
			await newContext.close()
		})

		test(`can be unpublished for ${u.description}`, async ({ page, browser, shareMenu }) => {
			const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.publishFile)
			expect(url).toMatch(/http:\/\/localhost:3000\/q\/p\//)

			const index = test.info().parallelIndex
			const userProps = u.user ? { user: u.user, index } : undefined
			const { newContext, newPage, newHomePage, errorPage } = await openNewIncognitoPage(browser, {
				url,
				userProps,
			})
			if (!userProps) await newHomePage.expectSignInButtonVisible()
			await errorPage.expectNotFoundNotVisible()
			await shareMenu.unpublishFile()
			await newPage.reload()
			await errorPage.expectNotFoundVisible()
			await newContext.close()
		})

		test(`${u.description} can copy a published file link`, async ({
			page,
			browser,
			shareMenu,
		}) => {
			const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.publishFile)
			expect(url).toMatch(/http:\/\/localhost:3000\/q\/p\//)

			const index = test.info().parallelIndex
			const userProps = u.user ? { user: u.user, index } : undefined
			const { newPage, newShareMenu } = await openNewIncognitoPage(browser, {
				url,
				userProps,
				allowClipboard: true,
			})
			// we have to wait a bit for the search params to get populated
			await newPage.waitForTimeout(500)
			const otherUserUrl = await newShareMenu.openMenuCopyLinkAndReturnUrl()
			expect(otherUserUrl).toBe(newPage.url())
		})
	})

	test.only('can be updated', async ({ page, browser, editor, shareMenu }) => {
		const url = await test.step('Create a shape and publish file', async () => {
			await page.getByTestId('tools.rectangle').click()
			await page.locator('.tl-background').click()
			await editor.expectShapesCount(1)
			const url = await shareFileAndCopyLink(page, shareMenu, shareMenu.publishFile)
			expect(url).toMatch(/http:\/\/localhost:3000\/q\/p\//)
			return url
		})

		const { newContext, newPage, newHomePage, newEditor } =
			await test.step('Open the page in another window', async () => {
				const result = await openNewIncognitoPage(browser, {
					url,
					userProps: undefined,
				})
				await result.newHomePage.isLoaded()
				await result.newEditor.expectShapesCount(1)
				return result
			})

		await test.step('Update the document (duplicate the shape)', async () => {
			await page.getByTestId('quick-actions.duplicate').click()

			// lets reload to make sure the change would have time to propagate
			await newPage.reload()
			await newHomePage.isLoaded()
			// We haven't published changes yet, so the new page should still only see one shape
			await newEditor.expectShapesCount(1)
		})

		await test.step('Publish the changes and check for updates', async () => {
			await shareMenu.open()
			await shareMenu.publishChanges()
			await newPage.reload()
			await newHomePage.isLoaded()
			await newEditor.expectShapesCount(2)
			await newContext.close()
		})
	})
})
