import { createTLStore, defaultShapes } from '@tldraw/editor'
import { TldrawFile } from '@tldraw/file-format'
import * as vscode from 'vscode'
import { nicelog } from './utils'

export const defaultFileContents: TldrawFile = {
	tldrawFileFormatVersion: 1,
	schema: createTLStore({ shapes: defaultShapes }).schema.serialize(),
	records: [],
}

export const fileContentWithErrors: TldrawFile = {
	tldrawFileFormatVersion: 1,
	schema: createTLStore({ shapes: defaultShapes }).schema.serialize(),
	records: [{ typeName: 'shape', id: null } as any],
}

export function loadFile(fileContents: string): TldrawFile {
	if (!fileContents) return defaultFileContents
	try {
		return JSON.parse(fileContents) as TldrawFile
	} catch (e) {
		return fileContentWithErrors
	}
}

export async function fileExists(destination: vscode.Uri) {
	try {
		await vscode.workspace.fs.stat(destination)
		return true
	} catch (e: any) {
		if (e.code !== 'FileNotFound') {
			nicelog(e)
		}
		return false
	}
}
