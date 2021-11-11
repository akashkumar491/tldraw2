/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { TLDraw, TLDrawState, TLDrawDocument, TLDrawUser, useFileSystem } from '@tldraw/tldraw'
import * as React from 'react'
import { createClient, Presence } from '@liveblocks/client'
import { LiveblocksProvider, RoomProvider, useObject, useErrorListener } from '@liveblocks/react'
import { Utils } from '@tldraw/core'
import { useAccountHandlers } from '-hooks/useAccountHandlers'

interface TLDrawUserPresence extends Presence {
  user: TLDrawUser
}

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY || '',
  throttle: 80,
})

export default function MultiplayerEditor({
  roomId,
  isSponsor,
}: {
  roomId: string
  isSponsor: boolean
}) {
  return (
    <LiveblocksProvider client={client}>
      <RoomProvider id={roomId}>
        <Editor roomId={roomId} isSponsor={isSponsor} />
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function Editor({ roomId, isSponsor }: { roomId: string; isSponsor: boolean }) {
  const [docId] = React.useState(() => Utils.uniqueId())

  const [state, setState] = React.useState<TLDrawState>()

  const [error, setError] = React.useState<Error>()

  useErrorListener((err) => setError(err))

  // Setup document

  const doc = useObject<{ uuid: string; document: TLDrawDocument }>('doc', {
    uuid: docId,
    document: {
      ...TLDrawState.defaultDocument,
      id: roomId,
    },
  })

  // Setup client

  React.useEffect(() => {
    const room = client.getRoom(roomId)

    if (!room) return
    if (!doc) return
    if (!state) return
    if (!state.state.room) return

    // Update the user's presence with the user from state
    const { users, userId } = state.state.room

    room.updatePresence({ id: userId, user: users[userId] })

    // Subscribe to presence changes; when others change, update the state
    room.subscribe<TLDrawUserPresence>('others', (others) => {
      state.updateUsers(
        others
          .toArray()
          .filter((other) => other.presence)
          .map((other) => other.presence!.user)
          .filter(Boolean)
      )
    })

    room.subscribe('event', (event) => {
      if (event.event?.name === 'exit') {
        state.removeUser(event.event.userId)
      }
    })

    function handleDocumentUpdates() {
      if (!doc) return
      if (!state) return
      if (!state.state.room) return

      const docObject = doc.toObject()

      // Only merge the change if it caused by someone else
      if (docObject.uuid !== docId) {
        state.mergeDocument(docObject.document)
      } else {
        state.updateUsers(
          Object.values(state.state.room.users).map((user) => {
            return {
              ...user,
              selectedIds: user.selectedIds,
            }
          })
        )
      }
    }

    function handleExit() {
      if (!(state && state.state.room)) return
      room?.broadcastEvent({ name: 'exit', userId: state.state.room.userId })
    }

    window.addEventListener('beforeunload', handleExit)

    // When the shared document changes, update the state
    doc.subscribe(handleDocumentUpdates)

    // Load the shared document
    const newDocument = doc.toObject().document

    if (newDocument) {
      state.loadDocument(newDocument)
    }

    return () => {
      window.removeEventListener('beforeunload', handleExit)
      doc.unsubscribe(handleDocumentUpdates)
    }
  }, [doc, docId, state, roomId])

  const handleMount = React.useCallback(
    (state: TLDrawState) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.state = state
      state.loadRoom(roomId)
      setState(state)
    },
    [roomId]
  )

  const handlePersist = React.useCallback(
    (state: TLDrawState) => {
      doc?.update({ uuid: docId, document: state.document })
    },
    [docId, doc]
  )

  const handleUserChange = React.useCallback(
    (state: TLDrawState, user: TLDrawUser) => {
      const room = client.getRoom(roomId)
      room?.updatePresence({ id: state.state.room?.userId, user })
    },
    [roomId]
  )

  const fileSystemEvents = useFileSystem()

  const accountEvents = useAccountHandlers()

  if (error) return <div>Error: {error.message}</div>

  if (doc === null) return <div>Loading...</div>

  return (
    <div className="tldraw">
      <TLDraw
        autofocus
        onMount={handleMount}
        onPersist={handlePersist}
        onUserChange={handleUserChange}
        showPages={false}
        showSponsorLink={isSponsor}
        {...fileSystemEvents}
        {...accountEvents}
      />
    </div>
  )
}
