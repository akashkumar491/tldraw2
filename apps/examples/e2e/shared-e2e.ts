import { PlaywrightTestArgs, PlaywrightWorkerArgs } from '@playwright/test'
import { App } from '@tldraw/tldraw'

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

// export async function expectPathToBe(page: Page, path: string) {
// 	expect(await page.evaluate(() => app.root.path.value)).toBe(path)
// }

// export async function expectToHaveNShapes(page: Page, numberOfShapes: number) {
// 	expect(await page.evaluate(() => app.shapesArray.length)).toBe(numberOfShapes)
// }

// export async function expectToHaveNSelectedShapes(page: Page, numberOfSelectedShapes: number) {
// 	expect(await page.evaluate(() => app.selectedIds.length)).toBe(numberOfSelectedShapes)
// }

declare const app: App

export async function setup({ page }: PlaywrightTestArgs & PlaywrightWorkerArgs) {
	await page.goto('http://localhost:5420/')
	await page.waitForSelector('.tl-canvas')
	await page.evaluate(() => (app.enableAnimations = false))
}

export async function setupWithShapes({
	page,
	context,
}: PlaywrightTestArgs & PlaywrightWorkerArgs) {
	await setup({ page, context } as any)

	await page.keyboard.press('r')
	await page.mouse.click(200, 200)
	await page.keyboard.press('r')
	await page.mouse.click(200, 250)
	await page.keyboard.press('r')
	await page.mouse.click(250, 300)
	await page.evaluate(() => app.selectNone())
}

export async function cleanup({ page }: PlaywrightTestArgs) {
	await page.keyboard.press('Control+a')
	await page.keyboard.press('Delete')
}

export async function getAllShapeLabels(page: PlaywrightTestArgs['page']) {
	return await page
		.locator('.tl-shapes')
		.first()
		.evaluate((e) => {
			const labels: { index: string; label: string }[] = []
			for (const child of e.children) {
				const index = (child as HTMLDivElement).style.zIndex
				const label = child.querySelector('.tl-text-content') as HTMLDivElement
				labels.push({ index, label: label.innerText })
			}
			labels.sort((a, b) => (a.index > b.index ? 1 : -1))
			return labels.map((l) => l.label)
		})
}

export async function getAllShapeTypes(page: PlaywrightTestArgs['page']) {
	return await page
		.locator('.tl-shape')
		.elementHandles()
		.then((handles) => Promise.all(handles.map((h) => h.getAttribute('data-shape-type'))))
}
