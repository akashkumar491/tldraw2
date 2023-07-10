/// <reference types="react" />

/** @internal */
import '@tldraw/polyfills'
// eslint-disable-next-line local/no-export-star
export * from '@tldraw/editor'
// eslint-disable-next-line local/no-export-star
export * from '@tldraw/primitives'
// eslint-disable-next-line local/no-export-star
export * from '@tldraw/ui'
export { Tldraw } from './lib/Tldraw'
export { defaultShapeTools } from './lib/defaultShapeTools'
export { defaultShapeUtils } from './lib/defaultShapeUtils'
export { defaultTools } from './lib/defaultTools'
