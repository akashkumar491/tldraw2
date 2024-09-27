import { ReactNode, createContext, useContext, useEffect, useState } from 'react'

import { TldrawAppFileRecordType, tldrawAppSchema } from '@tldraw/dotcom-shared'
import { useSync } from '@tldraw/sync'
import {
	assertExists,
	deleteFromLocalStorage,
	getFromLocalStorage,
	inlineBase64AssetStore,
} from 'tldraw'
import { MULTIPLAYER_SERVER } from '../../utils/config'
import { USER_ID_KEY } from '../components/TlaAppProvider'
import { TlaErrorPage } from '../components/TlaErrorPage'
import { TlaWrapperCentered } from '../components/TlaWrapperCentered'
import { TldrawApp } from '../utils/TldrawApp'
import { TEMPORARY_FILE_KEY } from '../utils/temporary-files'

const appContext = createContext<TldrawApp | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
	const [ready, setReady] = useState(false)
	const [app, setApp] = useState({} as TldrawApp)

	// eslint-disable-next-line no-restricted-syntax
	const userId = localStorage.getItem(USER_ID_KEY)
	if (!userId) {
		throw new Error('should have redirected in TlaAppProvider')
	}

	const store = useSync({
		schema: tldrawAppSchema as any,
		uri: `${MULTIPLAYER_SERVER}/app/${encodeURIComponent(userId)}`,
		assets: inlineBase64AssetStore,
	})

	useEffect(() => {
		if (store.status !== 'synced-remote') {
			return
		}
		let _app: TldrawApp

		TldrawApp.create({
			userId,
			store: store.store as any,
		}).then((app) => {
			const claimTemporaryFileId = getFromLocalStorage(TEMPORARY_FILE_KEY)
			if (claimTemporaryFileId) {
				deleteFromLocalStorage(TEMPORARY_FILE_KEY)
				app.claimTemporaryFile(TldrawAppFileRecordType.createId(claimTemporaryFileId))
			}
			_app = app
			setApp(app)
			setReady(true)
		})

		return () => {
			if (_app) {
				_app.dispose()
			}
		}
	}, [store.status, store.store, userId])

	if (store.status === 'error') {
		return <TlaErrorPage error={'no-user-access'} />
	}

	if (store.status === 'loading' || !ready || !app) {
		return <TlaWrapperCentered>Loading...</TlaWrapperCentered>
	}

	return <appContext.Provider value={app}>{children}</appContext.Provider>
}

export function useMaybeApp() {
	return useContext(appContext)
}
export function useApp(): TldrawApp {
	return assertExists(useContext(appContext), 'useApp must be used within AppStateProvider')
}
