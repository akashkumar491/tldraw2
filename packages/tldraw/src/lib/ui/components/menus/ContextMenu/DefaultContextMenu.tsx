import { useEditor, useValue } from '@tldraw/editor'
import {
	ClipboardMenuGroup,
	ConversionsMenuGroup,
	DeleteGroup,
	DuplicateMenuItem,
	EditLinkMenuItem,
	EmbedsGroup,
	FitFrameToContentMenuItem,
	GroupMenuItem,
	ModifyMenuGroup,
	RemoveFrameMenuItem,
	SetSelectionGroup,
	ToggleAutoSizeMenuItem,
	ToggleLockMenuItem,
	UngroupMenuItem,
} from '../MenuItems/MenuItems'
import { TldrawUiMenuGroup } from '../MenuItems/TldrawUiMenuGroup'

/** @public */
export function DefaultContextMenu() {
	const editor = useEditor()

	const selectToolActive = useValue(
		'isSelectToolActive',
		() => editor.getCurrentToolId() === 'select',
		[editor]
	)

	if (!selectToolActive) return null

	return (
		<>
			<SelectionMenuGroup />
			<EmbedsGroup />
			<ModifyMenuGroup />
			<ClipboardMenuGroup />
			<ConversionsMenuGroup />
			<SetSelectionGroup />
			<DeleteGroup />
		</>
	)
}

function SelectionMenuGroup() {
	return (
		<TldrawUiMenuGroup id="selection">
			<ToggleAutoSizeMenuItem />
			<EditLinkMenuItem />
			<DuplicateMenuItem />
			<GroupMenuItem />
			<UngroupMenuItem />
			<RemoveFrameMenuItem />
			<FitFrameToContentMenuItem />
			<ToggleLockMenuItem />
		</TldrawUiMenuGroup>
	)
}
