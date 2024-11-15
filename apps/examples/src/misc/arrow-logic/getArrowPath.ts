import { Vec } from 'tldraw'
import { ArrowDirection, MINIMUM_LEG_LENGTH } from './constants'
import { ArrowNavigationGrid } from './getArrowNavigationGrid'
import { getBrokenEdges } from './getBrokenEdge'

export const sArrowErrors = {
	SHORT_OUTSIDE_LEGS: 'SHORT_OUTSIDE_LEGS',
	SHORT_MIDDLE_LEG: 'SHORT_MIDDLE_LEG',
	NO_FIRST_STEP: 'NO_FIRST_STEP',
	NO_SECOND_STEP: 'NO_SECOND_STEP',
	NO_THIRD_STEP: 'NO_THIRD_STEP',
	NO_FOURTH_STEP: 'NO_FOURTH_STEP',
	POINT_BOX_OVERLAP: 'POINT_BOX_OVERLAP',
	NO_BROKEN_EDGE: 'NO_BROKEN_EDGE',
}

export type SArrowError = (typeof sArrowErrors)[keyof typeof sArrowErrors]

export function getArrowPath(
	g: ArrowNavigationGrid
): { error: true; reason: SArrowError } | { error: false; path: Vec[] } {
	let path: Vec[] = []

	const edgesResult = getBrokenEdges(g)

	if (edgesResult.error) {
		return { error: true, reason: sArrowErrors.NO_BROKEN_EDGE }
	}

	const [brokenEdgeA] = edgesResult.dirs

	// console.log(brokenEdgeA, g.vDir, g.hDir, g.overlap)

	if ((brokenEdgeA === 'right' && !g.overlap) || (brokenEdgeA === 'left' && g.overlap)) {
		if (sArrowMiddleLegTooShort(g, 'right')) {
			// Short outside leg, try an i arrow
			path = getIArrowPath(g, 'right')
		} else if (sArrowOutsideLegTooShort(g, 'right')) {
			// Short middle leg
			if (g.vDir === 'down') {
				if (g.A.r.y > g.B.e.t.y) {
					path = getUArrowPath(g, 'right', 'down')
				} else if (g.A.e.r.x > g.B.e.t.x) {
					path = [g.A.r, g.A.e.r, g.D.rct, g.D.rcb, g.B.e.r, g.B.r]
				} else {
					path = getLArrowPath(g, 'right')
				}
			} else if (g.vDir === 'up') {
				if (g.A.r.y < g.B.e.b.y) {
					path = getUArrowPath(g, 'right', 'up')
				} else if (g.A.e.r.x > g.B.e.b.x) {
					path = [g.A.r, g.A.e.r, g.D.rcb, g.D.rct, g.B.e.r, g.B.r]
				} else {
					path = getLArrowPath(g, 'right')
				}
			}
		} else {
			path = getSArrowPath(g, 'right')
		}
	} else if ((brokenEdgeA === 'down' && !g.overlap) || (brokenEdgeA === 'up' && g.overlap)) {
		if (sArrowMiddleLegTooShort(g, 'down')) {
			path = getIArrowPath(g, 'down')
		} else if (sArrowOutsideLegTooShort(g, 'down')) {
			if (g.hDir === 'left') {
				if (g.A.e.l.x < g.B.e.t.x) {
					path = getUArrowPath(g, 'down', 'left')
				} else if (g.A.e.l.y > g.B.e.t.y) {
					path = [g.A.t, g.A.e.t, g.D.tcr, g.D.tcl, g.B.e.t, g.B.t]
				} else {
					path = getLArrowPath(g, 'down')
				}
			} else if (g.hDir === 'right') {
				if (g.A.e.r.x > g.B.e.t.x) {
					path = getUArrowPath(g, 'down', 'right')
				} else if (g.A.e.r.y > g.B.e.t.y) {
					path = [g.A.t, g.A.e.t, g.D.tcl, g.D.tcr, g.B.e.t, g.B.t]
				} else {
					path = getLArrowPath(g, 'down')
				}
			}
		} else {
			path = getSArrowPath(g, 'down')
		}
	} else if ((brokenEdgeA === 'left' && !g.overlap) || (brokenEdgeA === 'right' && g.overlap)) {
		if (sArrowMiddleLegTooShort(g, 'left')) {
			path = getIArrowPath(g, 'left')
		} else if (sArrowOutsideLegTooShort(g, 'left')) {
			if (g.vDir === 'down') {
				if (g.A.l.y > g.B.e.t.y) {
					path = getUArrowPath(g, 'left', 'down')
				} else if (g.A.e.l.x < g.B.e.t.x) {
					path = [g.A.l, g.A.e.l, g.D.lct, g.D.lcb, g.B.e.l, g.B.l]
				} else {
					path = getLArrowPath(g, 'left')
				}
			} else if (g.vDir === 'up') {
				if (g.A.l.y < g.B.e.b.y) {
					path = getUArrowPath(g, 'left', 'right')
				} else if (g.A.e.l.x < g.B.e.b.x) {
					path = [g.A.l, g.A.e.l, g.D.lcb, g.D.lct, g.B.e.l, g.B.l]
				} else {
					path = getLArrowPath(g, 'left')
				}
			}
		} else {
			path = getSArrowPath(g, 'left')
		}
	} else if ((brokenEdgeA === 'up' && !g.overlap) || (brokenEdgeA === 'down' && g.overlap)) {
		if (sArrowMiddleLegTooShort(g, 'up')) {
			path = getIArrowPath(g, 'up')
		} else if (sArrowOutsideLegTooShort(g, 'up')) {
			if (g.hDir === 'left') {
				if (g.A.e.l.x < g.B.e.t.x) {
					path = getUArrowPath(g, 'up', 'left')
				} else if (g.A.e.l.y > g.B.e.b.y) {
					path = [g.A.b, g.A.e.b, g.D.bcr, g.D.bcl, g.B.e.b, g.B.b]
				} else {
					path = getLArrowPath(g, 'up')
				}
			} else if (g.hDir === 'right') {
				if (g.A.e.r.x > g.B.e.b.x) {
					path = getUArrowPath(g, 'up', 'right')
				} else if (g.A.e.l.y > g.B.e.t.y) {
					path = [g.A.b, g.A.e.b, g.D.bcl, g.D.bcr, g.B.e.b, g.B.b]
				} else {
					path = getLArrowPath(g, 'up')
				}
			}
		} else {
			path = getSArrowPath(g, 'up')
		}
	}

	return { error: false, path }
}

// Midle leg of an S is too short if the centers of A and B are too close on the axis of the leg
function sArrowMiddleLegTooShort(g: ArrowNavigationGrid, dir: ArrowDirection) {
	switch (dir) {
		case 'right': {
			return Math.abs(g.A.c.y - g.B.c.y) < MINIMUM_LEG_LENGTH
		}
		case 'down': {
			return Math.abs(g.A.c.x - g.B.c.x) < MINIMUM_LEG_LENGTH
		}
		case 'left': {
			return Math.abs(g.A.c.y - g.B.c.y) < MINIMUM_LEG_LENGTH
		}
		case 'up': {
			return Math.abs(g.A.c.x - g.B.c.x) < MINIMUM_LEG_LENGTH
		}
	}
}

// Outside leg of an S is too short if the edge of A is too close to the center of C
function sArrowOutsideLegTooShort(g: ArrowNavigationGrid, dir: ArrowDirection) {
	switch (dir) {
		case 'right': {
			return g.A.e.r.x > g.C.c.x
		}
		case 'down': {
			return g.A.e.b.y > g.C.c.y
		}
		case 'left': {
			return g.A.e.l.x < g.C.c.x
		}
		case 'up': {
			return g.A.e.t.y < g.C.c.y
		}
	}
}

// An I arrow is just a straight line aligned with the center of the shapes on the axis of the arrow
function getIArrowPath(g: ArrowNavigationGrid, dir: ArrowDirection, averaged?: boolean) {
	if (averaged) {
		switch (dir) {
			case 'right': {
				return [new Vec(g.A.r.x, g.C.c.y), new Vec(g.B.l.x, g.C.c.y)]
			}
			case 'down': {
				return [new Vec(g.C.c.x, g.A.b.y), new Vec(g.C.c.x, g.B.t.y)]
			}
			case 'left': {
				return [new Vec(g.A.l.x, g.C.c.y), new Vec(g.B.r.x, g.C.c.y)]
			}
			case 'up': {
				return [new Vec(g.C.c.x, g.A.t.y), new Vec(g.C.c.x, g.B.b.y)]
			}
		}
	}

	switch (dir) {
		case 'right': {
			return [new Vec(g.A.r.x, g.A.r.y), new Vec(g.B.l.x, g.A.r.y)]
		}
		case 'down': {
			return [new Vec(g.A.b.x, g.A.b.y), new Vec(g.A.b.x, g.B.t.y)]
		}
		case 'left': {
			return [new Vec(g.A.l.x, g.A.l.y), new Vec(g.B.r.x, g.A.l.y)]
		}
		case 'up': {
			return [new Vec(g.A.t.x, g.A.t.y), new Vec(g.A.t.x, g.B.b.y)]
		}
	}
}

// A U arrow goes out to the outside expanded bounds and wraps around the outside corner before returning to the other box on the same edge (e.g. top to top)
function getUArrowPath(g: ArrowNavigationGrid, dir1: ArrowDirection, dir2: ArrowDirection) {
	switch (dir1) {
		case 'right': {
			if (dir2 === 'down') {
				if (g.overlap) {
					return [g.A.t, g.A.e.t, g.D.tcr, g.D.tcl, g.B.e.t, g.B.t]
				} else {
					return [g.A.t, g.A.e.t, g.D.tcl, g.D.tcr, g.B.e.t, g.B.t]
				}
			} else if (dir2 === 'up') {
				if (g.overlap) {
					return [g.A.b, g.A.e.b, g.D.bcr, g.D.bcl, g.B.e.b, g.B.b]
				} else {
					return [g.A.b, g.A.e.b, g.D.bcl, g.D.bcr, g.B.e.b, g.B.b]
				}
			}
			break
		}
		case 'down': {
			if (dir2 === 'left') {
				if (g.overlap) {
					return [g.A.l, g.A.e.l, g.D.lcb, g.D.lct, g.B.e.l, g.B.l]
				} else {
					return [g.A.l, g.A.e.l, g.D.lct, g.D.lcb, g.B.e.l, g.B.l]
				}
			} else if (dir2 === 'right') {
				if (g.overlap) {
					return [g.A.r, g.A.e.r, g.D.rcb, g.D.rct, g.B.e.r, g.B.r]
				} else {
					return [g.A.r, g.A.e.r, g.D.rct, g.D.rcb, g.B.e.r, g.B.r]
				}
			}
			break
		}
		case 'left': {
			if (dir2 === 'down') {
				if (g.overlap) {
					return [g.A.t, g.A.e.t, g.D.tcl, g.D.tcr, g.B.e.t, g.B.t]
				} else {
					return [g.A.t, g.A.e.t, g.D.tcr, g.D.tcl, g.B.e.t, g.B.t]
				}
			} else if (dir2 === 'up') {
				if (g.overlap) {
					return [g.A.b, g.A.e.b, g.D.bcl, g.D.tcl, g.B.e.b, g.B.b]
				} else {
					return [g.A.b, g.A.e.b, g.D.tcl, g.D.bcl, g.B.e.b, g.B.b]
				}
			}
			break
		}
		case 'up': {
			if (dir2 === 'left') {
				if (g.overlap) {
					return [g.A.l, g.A.e.l, g.D.lct, g.D.lcb, g.B.e.l, g.B.l]
				} else {
					return [g.A.l, g.A.e.l, g.D.lcb, g.D.lct, g.B.e.l, g.B.l]
				}
			} else if (dir2 === 'right') {
				if (g.overlap) {
					return [g.A.r, g.A.e.r, g.D.rct, g.D.rcb, g.B.e.r, g.B.r]
				} else {
					return [g.A.r, g.A.e.r, g.D.rcb, g.D.rct, g.B.e.r, g.B.r]
				}
			}
			break
		}
	}

	return []
}

// An L arrow goes out to the outside of the center bounds and then returns to the other box on the closest edge (e.g. right to top)
function getLArrowPath(g: ArrowNavigationGrid, dir: ArrowDirection) {
	switch (dir) {
		case 'right': {
			return [
				g.A.r,
				g.A.e.r,
				g.vDir === 'down' ? g.C.tr : g.C.br,
				g.vDir === 'down' ? g.B.e.t : g.B.e.b,
				g.vDir === 'down' ? g.B.t : g.B.b,
			]
		}
		case 'down': {
			return [
				g.hDir === 'right' ? g.A.r : g.A.l,
				g.hDir === 'right' ? g.A.e.r : g.A.e.l,
				g.hDir === 'right' ? g.C.tr : g.C.tl,
				g.B.e.t,
				g.B.t,
			]
		}
		case 'left': {
			return [
				g.A.l,
				g.A.e.l,
				g.vDir === 'down' ? g.C.tl : g.C.bl,
				g.vDir === 'down' ? g.B.e.t : g.B.e.b,
				g.vDir === 'down' ? g.B.t : g.B.b,
			]
		}
		case 'up': {
			return [
				g.hDir === 'right' ? g.A.r : g.A.l,
				g.hDir === 'right' ? g.A.e.r : g.A.e.l,
				g.hDir === 'right' ? g.C.br : g.C.bl,
				g.B.e.b,
				g.B.b,
			]
		}
	}
}

function getSArrowPath(g: ArrowNavigationGrid, dir: ArrowDirection) {
	switch (dir) {
		case 'right': {
			return [
				g.A.r,
				g.A.e.r,
				g.vDir === 'down' ? g.C.t : g.C.b,
				g.vDir === 'down' ? g.C.b : g.C.t,
				g.B.e.l,
				g.B.l,
			]
		}
		case 'down': {
			return [
				g.A.b,
				g.A.e.b,
				g.hDir === 'left' ? g.C.r : g.C.l,
				g.hDir === 'left' ? g.C.l : g.C.r,
				g.B.e.t,
				g.B.t,
			]
		}
		case 'left': {
			return [
				g.A.l,
				g.A.e.l,
				g.vDir === 'down' ? g.C.t : g.C.b,
				g.vDir === 'down' ? g.C.b : g.C.t,
				g.B.e.r,
				g.B.r,
			]
		}
		case 'up': {
			return [
				g.A.t,
				g.A.e.t,
				g.hDir === 'left' ? g.C.r : g.C.l,
				g.hDir === 'left' ? g.C.l : g.C.r,
				g.B.e.b,
				g.B.b,
			]
		}
	}
}

function _cleverlyGetArrowPath(_grid: ArrowNavigationGrid) {
	// let's try an algorithm instead
	// we want to find a "valid" path that goes from a terminal on A to a terminal on B
	// a terminal is the top, right, bottom, or left point on box A or B
	// We want to start at g.A.t, g.A.r, g.A.b, or g.A.l
	// Next, we want to go to the corresponding point on the expanded box: g.A.e.t, g.A.e.r, g.A.e.b, or g.A.e.l
	// From there, we want to find the shortest path to any one of the expanded terminals on B: g.B.e.t, g.B.e.r, g.B.e.b, or g.B.e.l
	// And finally, we want to end at the corresponding point on B's box: g.B.t, g.B.r, g.B.b, or g.B.l
	// For example, a path from the top terminal of A to the bottom terminal of B would look like [g.A.t, g.A.e.t, ...pointsInBetween, g.B.e.b, g.B.b]
	// To complicate things, we'll need to add some rules about which points are valid
	// - any point on g.A or g.A.e that is inside of box B's expanded bounds is invalid
	// - any point on g.B or g.B.e that is inside of box A's expanded bounds is invalid
	// - any other point is valid only if it is inside of neither box's expanded bounds
	// We'll also want to add some rules about the path itself
	// - A path can never visit an invalid point
	// - A path can never revisit a point
	// - A path can only move to an adjacent point
	// - A path can only move in the same direction as its previous move, or at a right angle
	// - A path can never reverse direction, i.e. assuming points P-J-Q-R on a horizontal line, J-Q-R is valid, but J-Q-P is invalid
	// If the only "next move" would break a rule, then the path itself is invalid
	// Of all possible paths, we want to choose the path with...
	// - the fewest points
	// - the fewest turns
}
