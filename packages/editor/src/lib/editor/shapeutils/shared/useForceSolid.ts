import { useValue } from 'signia-react'
import { useEditor } from '../../../hooks/useEditor'

export function useForceSolid() {
	const editor = useEditor()
	return useValue('zoom', () => editor.zoomLevel < 0.35, [editor])
}
