import { T } from '@tldraw/validate'
import { createShapePropsMigrationSequence } from '../records/TLShape'
import { RecordProps } from '../recordsWithProps'
import { TLBaseShape } from './TLBaseShape'

/** @public */
export interface TLTimerShapeProps {
	initialTime: number
	remainingTime: number
	state: { state: 'running'; lastStartTime: number } | { state: 'stopped' | 'paused' }
}

/** @public */
export type TLTimerState = TLTimerShapeProps['state']['state']

/** @public */
export type TLTimerShape = TLBaseShape<'timer', TLTimerShapeProps>

const runningState = T.object({ state: T.literal('running'), lastStartTime: T.positiveNumber })
const pausedState = T.object({ state: T.literal('paused') })
const stoppedState = T.object({ state: T.literal('stopped') })

/** @public */
export const timerShapeProps: RecordProps<TLTimerShape> = {
	initialTime: T.positiveNumber,
	remainingTime: T.positiveNumber,
	state: T.union('state', { running: runningState, paused: pausedState, stopped: stoppedState }),
}

/** @public */
export const timerShapeMigrations = createShapePropsMigrationSequence({
	sequence: [],
})