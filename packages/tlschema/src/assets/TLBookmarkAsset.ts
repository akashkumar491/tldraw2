import { defineMigrations } from '@tldraw/store'
import { T } from '@tldraw/validate'
import { createAssetValidator, TLBaseAsset } from './TLBaseAsset'

// --- DEFINITION ---
/** @public */
export type TLBookmarkAsset = TLBaseAsset<
	'bookmark',
	{
		title: string
		description: string
		image: string
		src: string | null
	}
>

/** @public */
export const bookmarkAssetTypeValidator: T.Validator<TLBookmarkAsset> = createAssetValidator(
	'bookmark',
	T.object({
		title: T.string,
		description: T.string,
		image: T.string,
		src: T.string.nullable(),
	})
)

/** @public */
export const bookmarkAssetMigrations = defineMigrations({})
