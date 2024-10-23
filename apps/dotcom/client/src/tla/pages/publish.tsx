import { SerializedSchema, TLRecord, fetch } from 'tldraw'
import { IFrameProtector, ROOM_CONTEXT } from '../../components/IFrameProtector'
import { defineLoader } from '../../utils/defineLoader'
import { PUBLISH_ENDPOINT } from '../app/TldrawApp'
import { TlaSnapshotsEditor } from '../components/TlaEditor/TlaSnapshotsEditor'
import { useMaybeApp } from '../hooks/useAppState'
import { TlaAnonLayout } from '../layouts/TlaAnonLayout/TlaAnonLayout'
import { TlaSidebarLayout } from '../layouts/TlaSidebarLayout/TlaSidebarLayout'

const { loader, useData } = defineLoader(async (args) => {
	const fileSlug = args.params.fileSlug
	const result = await fetch(`${PUBLISH_ENDPOINT}/${fileSlug}`)
	if (!result.ok) throw new Error('Room not found')

	const data = await result.json()
	if (!data || data.error) throw new Error('Room not found')
	return data as {
		roomId: string
		schema: SerializedSchema
		records: TLRecord[]
	}
})

export { loader }

export function Component() {
	const result = useData()
	const { roomId, records, schema } = result
	const app = useMaybeApp()
	if (!app?.getCurrentUserId()) {
		return (
			<TlaAnonLayout>
				<IFrameProtector slug={roomId} context={ROOM_CONTEXT.PUBLIC_SNAPSHOT}>
					<TlaSnapshotsEditor records={records} schema={schema} />
				</IFrameProtector>
			</TlaAnonLayout>
		)
	}

	return (
		<TlaSidebarLayout collapsible>
			<IFrameProtector slug={roomId} context={ROOM_CONTEXT.PUBLIC_SNAPSHOT}>
				<TlaSnapshotsEditor records={records} schema={schema} />
			</IFrameProtector>
		</TlaSidebarLayout>
	)
}
