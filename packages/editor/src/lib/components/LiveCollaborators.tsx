import { useEffect, useRef, useState } from 'react'
import { track } from 'signia-react'
import { COLLABORATOR_CHECK_INTERVAL, COLLABORATOR_TIMEOUT } from '../constants'
import { useEditor } from '../hooks/useEditor'
import { useEditorComponents } from '../hooks/useEditorComponents'
import { usePeerIds } from '../hooks/usePeerIds'
import { usePresence } from '../hooks/usePresence'

export const LiveCollaborators = track(function Collaborators() {
	const peerIds = usePeerIds()
	return (
		<>
			{peerIds.map((id) => (
				<Collaborator key={id} userId={id} />
			))}
		</>
	)
})

const Collaborator = track(function Collaborator({ userId }: { userId: string }) {
	const editor = useEditor()
	const { viewportPageBounds, zoomLevel } = editor

	const {
		CollaboratorBrush,
		CollaboratorScribble,
		CollaboratorCursor,
		CollaboratorHint,
		CollaboratorShapeIndicator,
	} = useEditorComponents()

	const latestPresence = usePresence(userId)

	const [isTimedOut, setIsTimedOut] = useState(false)
	const rLastSeen = useRef(-1)

	useEffect(() => {
		const interval = setInterval(() => {
			setIsTimedOut(Date.now() - rLastSeen.current > COLLABORATOR_TIMEOUT)
		}, COLLABORATOR_CHECK_INTERVAL)

		return () => clearInterval(interval)
	}, [])

	if (!latestPresence) return null

	// We can do this on every render, it's free and would be the same as running a useEffect with a dependency on the timestamp
	rLastSeen.current = latestPresence.lastActivityTimestamp

	// If the user has timed out
	// ... and we're not following them
	// ... and they're not highlighted
	// then we'll hide the contributor
	if (
		isTimedOut &&
		editor.instanceState.followingUserId !== userId &&
		!editor.instanceState.highlightedUserIds.includes(userId)
	)
		return null

	// if the collaborator is on another page, ignore them
	if (latestPresence.currentPageId !== editor.currentPageId) return null

	const { brush, scribble, selectedIds, userName, cursor, color, chatMessage } = latestPresence

	// Add a little padding to the top-left of the viewport
	// so that the cursor doesn't get cut off
	const isCursorInViewport = !(
		cursor.x < viewportPageBounds.minX - 12 / zoomLevel ||
		cursor.y < viewportPageBounds.minY - 16 / zoomLevel ||
		cursor.x > viewportPageBounds.maxX - 12 / zoomLevel ||
		cursor.y > viewportPageBounds.maxY - 16 / zoomLevel
	)

	return (
		<>
			{brush && CollaboratorBrush ? (
				<CollaboratorBrush
					className="tl-collaborator__brush"
					key={userId + '_brush'}
					brush={brush}
					color={color}
					opacity={0.1}
				/>
			) : null}
			{isCursorInViewport && CollaboratorCursor ? (
				<CollaboratorCursor
					className="tl-collaborator__cursor"
					key={userId + '_cursor'}
					point={cursor}
					color={color}
					zoom={zoomLevel}
					name={userName !== 'New User' ? userName : null}
					chatMessage={chatMessage}
				/>
			) : CollaboratorHint ? (
				<CollaboratorHint
					className="tl-collaborator__cursor-hint"
					key={userId + '_cursor_hint'}
					point={cursor}
					color={color}
					zoom={zoomLevel}
					viewport={viewportPageBounds}
				/>
			) : null}
			{scribble && CollaboratorScribble ? (
				<CollaboratorScribble
					className="tl-collaborator__scribble"
					key={userId + '_scribble'}
					scribble={scribble}
					color={color}
					zoom={zoomLevel}
					opacity={scribble.color === 'laser' ? 0.5 : 0.1}
				/>
			) : null}
			{CollaboratorShapeIndicator &&
				selectedIds.map((shapeId) => (
					<CollaboratorShapeIndicator
						className="tl-collaborator__shape-indicator"
						key={userId + '_' + shapeId}
						id={shapeId}
						color={color}
						opacity={0.5}
					/>
				))}
		</>
	)
})
