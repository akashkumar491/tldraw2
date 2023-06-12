import { Signal, computed } from 'signia'
import { TLStore } from './TLStore'
import { CameraRecordType } from './records/TLCamera'
import { TLINSTANCE_ID } from './records/TLInstance'
import { InstancePageStateRecordType } from './records/TLPageState'
import { TLPOINTER_ID } from './records/TLPointer'
import { InstancePresenceRecordType, TLInstancePresence } from './records/TLPresence'

/** @internal */
export const createPresenceStateDerivation =
	($user: Signal<{ id: string; color: string; name: string }>) =>
	(store: TLStore): Signal<TLInstancePresence | null> => {
		return computed('instancePresence', () => {
			const instance = store.get(TLINSTANCE_ID)
			const pageState = store.get(InstancePageStateRecordType.createId(instance?.currentPageId))
			const camera = store.get(CameraRecordType.createId(instance?.currentPageId))
			const pointer = store.get(TLPOINTER_ID)
			const user = $user.value
			if (!pageState || !instance || !camera || !pointer || !user) {
				return null
			}

			return InstancePresenceRecordType.create({
				id: InstancePresenceRecordType.createId(store.id),
				selectedIds: pageState.selectedIds,
				brush: instance.brush,
				scribble: instance.scribble,
				userId: user.id,
				userName: user.name,
				followingUserId: instance.followingUserId,
				camera: {
					x: camera.x,
					y: camera.y,
					z: camera.z,
				},
				color: user.color,
				currentPageId: instance.currentPageId,
				cursor: {
					x: pointer.x,
					y: pointer.y,
					rotation: instance.cursor.rotation,
					type: instance.cursor.type,
				},
				lastActivityTimestamp: pointer.lastActivityTimestamp,
				screenBounds: instance.screenBounds,
			})
		})
	}
