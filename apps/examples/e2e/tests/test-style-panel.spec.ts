import { expect } from '@playwright/test'
import { setup } from '../shared-e2e'
import test from './fixtures/fixtures'

test.describe('Style selection behaviour', () => {
	test.beforeEach(setup)
	test('selecting a style highlights the button', async ({ isMobile, stylePanel, toolbar }) => {
		const { blue, black } = stylePanel.colors
		const { pattern, none } = stylePanel.fill
		if (isMobile) {
			await toolbar.mobileStylesButton.click()
		}
		// these are hinted by default
		await stylePanel.isHinted(black)
		await stylePanel.isHinted(none)
		// these are not hinted by default
		await stylePanel.isNotHinted(pattern)
		await stylePanel.isNotHinted(blue)

		await blue.click()
		await stylePanel.isHinted(blue)
		await stylePanel.isNotHinted(black)

		await pattern.click()
		await stylePanel.isHinted(pattern)
		await stylePanel.isNotHinted(none)
		// this should not change the hint state of color buttons
		await stylePanel.isHinted(blue)
	})

	test('the correct styles are exposed for the selected tool', async ({
		isMobile,
		page,
		toolbar,
		stylePanel,
	}) => {
		const toolsStylesArr = [
			{
				name: 'tools.select',
				styles: ['style.color', 'style.opacity', 'style.fill', 'style.dash', 'style.size'],
			},
			{ name: 'tools.more.frame', styles: ['style.opacity'] },
			{
				name: 'tools.text',
				styles: ['style.size', 'style.color', 'style.opacity', 'style.font', 'style.align'],
			},
		]

		for (const tool of toolsStylesArr) {
			await test.step(`Check tool ${tool.name}`, async () => {
				if (tool.name === 'tools.more.frame') {
					await toolbar.moreToolsButton.click()
				}
				await page.getByTestId(tool.name).click()

				if (isMobile) {
					await toolbar.mobileStylesButton.click()
				}

				for (const style of stylePanel.stylesArray) {
					const styleElement = page.getByTestId(style)
					const isVisible = await styleElement.isVisible()
					const isExpected = tool.styles.includes(style)
					expect(isVisible).toBe(isExpected)
				}
			})
		}
	})
})

test.describe('mobile style panel', () => {
	test.beforeEach(setup)
	test('opens and closes as expected', async ({ isMobile, page, toolbar, stylePanel }) => {
		test.skip(!isMobile, 'only run on mobile')

		await expect(stylePanel.getElement()).toBeHidden()
		await toolbar.mobileStylesButton.click()
		await expect(stylePanel.getElement()).toBeVisible()
		// clicking off the style panel should close it
		page.mouse.click(200, 200)
		await expect(stylePanel.getElement()).toBeHidden()
	})
	test('style menu button is disabled for the eraser tool', async ({ isMobile, toolbar }) => {
		test.skip(!isMobile, 'only run on mobile')
		const { eraser } = toolbar.tools
		await eraser.click()
		await expect(toolbar.mobileStylesButton).toBeDisabled()
	})
})
