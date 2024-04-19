import { RoomOpenMode } from '@tldraw/dotcom-shared'
import { useParams } from 'react-router-dom'
import '../../styles/globals.css'
import { IFrameProtector, ROOM_CONTEXT } from '../components/IFrameProtector'
import { MultiplayerEditor } from '../components/MultiplayerEditor'

export function Component() {
	const id = useParams()['roomId'] as string
	return (
		<IFrameProtector slug={id} context={ROOM_CONTEXT.PUBLIC_MULTIPLAYER}>
			<MultiplayerEditor roomOpenMode={RoomOpenMode.READ_WRITE} roomSlug={id} />
		</IFrameProtector>
	)
}
