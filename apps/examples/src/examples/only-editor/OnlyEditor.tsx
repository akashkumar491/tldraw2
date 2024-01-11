/* eslint-disable import/no-extraneous-dependencies */

import { Editor, PositionedOnCanvas, TldrawEditor, createShapeId, track } from '@tldraw/editor'
import { MicroSelectTool } from './MicroSelectTool'
import { MiniBoxShapeUtil } from './MiniBoxShape'

// There's a guide at the bottom of this page!

// [1]
const myTools = [MicroSelectTool]
const myShapeUtils = [MiniBoxShapeUtil]

// [2]
export default function OnlyEditorExample() {
	return (
		<div className="tldraw__editor">
			<TldrawEditor
				tools={myTools}
				shapeUtils={myShapeUtils}
				initialState="select"
				onMount={(editor: Editor) => {
					editor
						.selectAll()
						.deleteShapes(editor.getSelectedShapeIds())
						.createShapes([
							{
								id: createShapeId(),
								type: 'box',
								x: 100,
								y: 100,
							},
						])
				}}
				components={{
					Background: BackgroundComponent,
				}}
			/>
		</div>
	)
}

// [3]
const BackgroundComponent = track(() => {
	return (
		<PositionedOnCanvas x={16} y={16}>
			<p>Double click to create or delete shapes.</p>
			<p>Click or Shift+Click to select shapes.</p>
			<p>Click and drag to move shapes.</p>
		</PositionedOnCanvas>
	)
})

/* 
This example shows how to use the TldrawEditor component on its own. This is useful if you want to
create your own custom UI, shape and tool interactions.

[1]
We create a custom tool and shape util arrays. These are arrays of classes that extend
the built-in state node and shape util classes. Check out MiniSelectTool.ts and 
MiniBoxShapeUtil.tsx to see how they work. Or check out the custom config example for 
a more in-depth look at how to create custom tools and shapes. 

There is an even simpler implementation of the select tool in MicroSelectTool.tsx, but it
isn't used in this example.

[2]
We pass our custom tools and shape utils to the TldrawEditor component. We also pass in our custom
background component to the background prop and set the initial state to the 'select' tool.
*/
