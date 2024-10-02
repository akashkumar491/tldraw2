import { TLIncompatibilityReason, TLRemoteSyncError } from '@tldraw/sync-core'
import { exhaustiveSwitchError } from 'tldraw'
import { ErrorPage } from './ErrorPage/ErrorPage'

export function StoreErrorScreen({ error }: { error: Error }) {
	let header = 'Could not connect to server.'
	let message = ''
	if (error instanceof TLRemoteSyncError) {
		switch (error.reason) {
			case TLIncompatibilityReason.ClientTooOld: {
				return (
					<ErrorPage
						icon={
							<img
								width={36}
								height={36}
								src="/tldraw-white-on-black.svg"
								loading="lazy"
								role="presentation"
							/>
						}
						messages={{
							header: 'Refresh the page',
							para1: 'You need to update to the latest version of tldraw to continue.',
						}}
						cta={<button onClick={() => window.location.reload()}>Refresh</button>}
					/>
				)
			}
			case TLIncompatibilityReason.ServerTooOld: {
				message =
					'The multiplayer server is out of date. Please reload the page. If the problem persists contact the system administrator.'
				break
			}
			case TLIncompatibilityReason.InvalidRecord: {
				message =
					'Your changes were rejected by the server. Please reload the page. If the problem persists contact the system administrator.'
				break
			}
			case TLIncompatibilityReason.InvalidOperation: {
				message =
					'Your changes were rejected by the server. Please reload the page. If the problem persists contact the system administrator.'
				break
			}
			case TLIncompatibilityReason.RoomNotFound: {
				header = 'Room not found'
				message = 'The room you are trying to connect to does not exist.'
				break
			}
			case TLIncompatibilityReason.NotAuthorized: {
				header = 'Not authorized'
				message = 'You are not authorized to view this room.'
				break
			}
			default:
				exhaustiveSwitchError(error.reason)
		}
	}

	return <ErrorPage messages={{ header, para1: message }} />
}
