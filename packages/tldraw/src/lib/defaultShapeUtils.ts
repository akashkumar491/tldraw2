import { ArrowShapeUtil } from './shapes/arrow/ArrowShapeUtil'
import { AudioShapeUtil } from './shapes/audio/AudioShapeUtil'
import { BookmarkShapeUtil } from './shapes/bookmark/BookmarkShapeUtil'
import { DrawShapeUtil } from './shapes/draw/DrawShapeUtil'
import { EmbedShapeUtil } from './shapes/embed/EmbedShapeUtil'
import { FrameShapeUtil } from './shapes/frame/FrameShapeUtil'
import { GeoShapeUtil } from './shapes/geo/GeoShapeUtil'
import { HighlightShapeUtil } from './shapes/highlight/HighlightShapeUtil'
import { ImageShapeUtil } from './shapes/image/ImageShapeUtil'
import { LineShapeUtil } from './shapes/line/LineShapeUtil'
import { NoteShapeUtil } from './shapes/note/NoteShapeUtil'
import { TextShapeUtil } from './shapes/text/TextShapeUtil'
import { VideoShapeUtil } from './shapes/video/VideoShapeUtil'

/** @public */
export const defaultShapeUtils = [
	TextShapeUtil,
	BookmarkShapeUtil,
	DrawShapeUtil,
	GeoShapeUtil,
	NoteShapeUtil,
	LineShapeUtil,
	FrameShapeUtil,
	ArrowShapeUtil,
	HighlightShapeUtil,
	EmbedShapeUtil,
	ImageShapeUtil,
	VideoShapeUtil,
	AudioShapeUtil,
] as const
