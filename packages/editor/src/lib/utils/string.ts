/** @public */
export function defaultEmptyAs(str: string, dflt: string) {
	if (str.match(/^\s*$/)) {
		return dflt
	}
	return str
}

/** @public */
export async function blobAsString(blob: Blob) {
	return new Promise<string>((resolve, reject) => {
		const reader = new FileReader()
		reader.addEventListener('loadend', () => {
			const text = reader.result
			resolve(text as string)
		})
		reader.addEventListener('error', () => {
			reject(reader.error)
		})
		reader.readAsText(blob)
	})
}

/** @public */
export async function dataTransferItemAsString(item: DataTransferItem) {
	return new Promise<string>((resolve) => {
		item.getAsString((text) => {
			resolve(text)
		})
	})
}

/** @public */
export function correctSpacesToNbsp(input: string) {
	return input.replace(/\t/g, '\xa0\xa0').replace(/\s(\s+)/g, (_str, match) => {
		let out = ' '
		for (let i = 0; i < match.length; i++) {
			out += '\xa0'
		}
		return out
	})
}
