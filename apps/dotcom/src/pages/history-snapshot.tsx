import { RoomSnapshot } from '@tldraw/tlsync'
import '../../styles/globals.css'
import { BoardHistorySnapshot } from '../components/BoardHistorySnapshot/BoardHistorySnapshot'
import { ErrorPage } from '../components/ErrorPage/ErrorPage'
import { IFrameProtector } from '../components/IFrameProtector'
import { defineLoader } from '../utils/defineLoader'

const { loader, useData } = defineLoader(async (args) => {
	const roomId = args.params.boardId
	const timestamp = args.params.timestamp

	if (!roomId) return null

	const result = await fetch(`/api/r/${roomId}/history/${timestamp}`, {
		headers: {},
	})
	if (!result.ok) return null
	const data = (await result.json()) as RoomSnapshot

	return { data, roomId, timestamp }
})

export { loader }

export function Component() {
	const result = useData()
	if (!result || !result.timestamp)
		return (
			<ErrorPage
				icon
				messages={{
					header: 'Page not found',
					para1: 'The page you are looking does not exist or has been moved.',
				}}
				redirectTo="/"
			/>
		)

	const { data, roomId, timestamp } = result
	return (
		<IFrameProtector slug={roomId} context="history-snapshot">
			<BoardHistorySnapshot data={data} roomId={roomId} timestamp={timestamp} />
		</IFrameProtector>
	)
}
