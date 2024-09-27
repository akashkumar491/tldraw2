import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu'
import classNames from 'classnames'
import { useCallback } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { TldrawUiButton, TldrawUiButtonLabel, TldrawUiDropdownMenuTrigger, useValue } from 'tldraw'
import { useApp } from '../../hooks/useAppState'
import { TldrawApp } from '../../utils/TldrawApp'
import { TldrawAppFile, TldrawAppFileRecordType } from '../../utils/schema/TldrawAppFile'
import { getCleanId } from '../../utils/tldrawAppSchema'
import { getFileUrl } from '../../utils/urls'
import { TlaAvatar } from '../TlaAvatar/TlaAvatar'
import { TlaIcon, TlaIconWrapper } from '../TlaIcon/TlaIcon'
import { TlaSpacer } from '../TlaSpacer/TlaSpacer'
import styles from './sidebar.module.css'

export function TlaSidebar() {
	const app = useApp()
	const isSidebarOpen = useValue('sidebar open', () => app.getSessionState().isSidebarOpen, [app])
	const isSidebarOpenMobile = useValue(
		'sidebar open mobile',
		() => app.getSessionState().isSidebarOpenMobile,
		[app]
	)

	const handleOverlayClick = useCallback(() => {
		app.toggleSidebarMobile()
	}, [app])

	return (
		<>
			<button
				className={styles.sidebarOverlayMobile}
				data-visiblemobile={isSidebarOpenMobile}
				onClick={handleOverlayClick}
			/>
			<div
				className={styles.sidebar}
				data-visible={isSidebarOpen}
				data-visiblemobile={isSidebarOpenMobile}
			>
				<div className={styles.top}>
					<TlaSidebarWorkspaceLink />
					<TlaSidebarCreateFileButton />
				</div>
				<div className={styles.content}>
					<TlaSidebarRecentFiles />
				</div>
				<div className={styles.bottom}>
					<TlaSidebarUserLink />
				</div>
			</div>
		</>
	)
}

function TlaSidebarWorkspaceLink() {
	return (
		<div className={styles.workspace}>
			<TlaIconWrapper data-size="m">
				<TlaIcon icon="tldraw" />
			</TlaIconWrapper>
			<div className={classNames(styles.label, 'tla-text_ui__title')}>tldraw</div>
			<button className={styles.linkButton} />
		</div>
	)
}

function TlaSidebarCreateFileButton() {
	const app = useApp()
	const navigate = useNavigate()

	const handleSidebarCreate = useCallback(() => {
		const { auth } = app.getSessionState()
		if (!auth) return false

		const id = TldrawAppFileRecordType.createId()
		app.store.put([
			TldrawAppFileRecordType.create({
				id,
				owner: auth.userId,
			}),
		])
		navigate(getFileUrl(id))
	}, [app, navigate])

	return (
		<button className={styles.create} onClick={handleSidebarCreate}>
			<TlaIcon icon="edit-strong" />
		</button>
	)
}

function TlaSidebarUserLink() {
	const app = useApp()

	const result = useValue(
		'auth',
		() => {
			const { auth } = app.getSessionState()
			if (!auth) return false
			const user = app.store.get(auth.userId)!
			return {
				auth,
				user,
			}
		},
		[app]
	)

	const location = useLocation()

	if (!result) throw Error('Could not get user')

	return (
		<div className={classNames(styles.user, styles.hoverable, 'tla-text_ui__regular')}>
			<TlaIconWrapper>
				<TlaAvatar size="s" />
			</TlaIconWrapper>
			<div className={styles.label}>{result.user.name}</div>
			{/* <Link className="__link-button" to={getUserUrl(result.auth.userId)} /> */}
			<Link className={styles.linkButton} to={'/q/profile'} state={{ background: location }} />
			<Link className={styles.linkMenu} to={'/q/debug'} state={{ background: location }}>
				<TlaIcon icon="dots-vertical-strong" />
			</Link>
		</div>
	)
}

function TlaSidebarRecentFiles() {
	const app = useApp()
	const results = useValue(
		'recent user files',
		() => {
			const { auth, createdAt: sessionStart } = app.getSessionState()
			if (!auth) return false

			return app.getUserRecentFiles(auth.userId, sessionStart)
		},
		[app]
	)

	if (!results) throw Error('Could not get files')

	// split the files into today, yesterday, this week, this month, and then by month
	const day = 1000 * 60 * 60 * 24
	const todayFiles: TldrawAppFile[] = []
	const yesterdayFiles: TldrawAppFile[] = []
	const thisWeekFiles: TldrawAppFile[] = []
	const thisMonthFiles: TldrawAppFile[] = []

	// todo: order by month
	const olderFiles: TldrawAppFile[] = []

	const now = Date.now()

	for (const item of results) {
		const { date, file } = item
		if (date > now - day * 1) {
			todayFiles.push(file)
		} else if (date > now - day * 2) {
			yesterdayFiles.push(file)
		} else if (date > now - day * 7) {
			thisWeekFiles.push(file)
		} else if (date > now - day * 30) {
			thisMonthFiles.push(file)
		} else {
			olderFiles.push(file)
		}
	}

	return (
		<>
			{todayFiles.length ? <TlaSidebarFileSection title={'Today'} files={todayFiles} /> : null}
			{yesterdayFiles.length ? (
				<TlaSidebarFileSection title={'Yesterday'} files={yesterdayFiles} />
			) : null}
			{thisWeekFiles.length ? (
				<TlaSidebarFileSection title={'This week'} files={thisWeekFiles} />
			) : null}
			{thisMonthFiles.length ? (
				<TlaSidebarFileSection title={'This month'} files={thisMonthFiles} />
			) : null}
			{olderFiles.length ? (
				<TlaSidebarFileSection title={'This year'} files={thisMonthFiles} />
			) : null}
		</>
	)
}

function TlaSidebarFileSection({ title, files }: { title: string; files: TldrawAppFile[] }) {
	return (
		<div className={styles.section}>
			<TlaSpacer height="8" />
			<div className={classNames(styles.sectionTitle, 'tla-text_ui__medium')}>{title}</div>
			{files.map((file) => (
				<TlaSidebarFileLink key={'recent_' + file.id} file={file} />
			))}
		</div>
	)
}

function TlaSidebarFileLink({ file }: { file: TldrawAppFile }) {
	const { id } = file
	const { fileId } = useParams()
	const isActive = fileId === getCleanId(id)
	return (
		<div className={classNames(styles.link, styles.hoverable)} data-active={isActive}>
			<div className={styles.linkContent}>
				<div className={classNames(styles.label, 'tla-text_ui__regular')}>
					{TldrawApp.getFileName(file)}
				</div>
			</div>
			<Link to={getFileUrl(id)} className={styles.linkButton} />
			<TlaSidebarFileLinkMenu fileId={file.id} />
		</div>
	)
}

/* ---------------------- Menu ---------------------- */

function TlaSidebarFileLinkMenu(_props: { fileId: TldrawAppFile['id'] }) {
	// const app = useApp()

	const handleCopyLinkClick = useCallback(() => {
		// copy file url
	}, [])

	const handleRenameLinkClick = useCallback(() => {
		// open rename dialog
	}, [])

	const handleDuplicateLinkClick = useCallback(() => {
		// duplicate file
	}, [])

	const handleStarLinkClick = useCallback(() => {
		// toggle star file
	}, [])

	const handleDeleteLinkClick = useCallback(() => {
		// toggle star file
	}, [])

	return (
		<DropdownPrimitive.Root dir="ltr" modal={false}>
			<TldrawUiDropdownMenuTrigger>
				<button className={styles.linkMenu}>
					<TlaIcon icon="dots-vertical-strong" />
				</button>
			</TldrawUiDropdownMenuTrigger>
			<DropdownPrimitive.Content
				className={classNames('tlui-menu', 'tla-text_ui__medium')}
				data-size="small"
				side="bottom"
				align="start"
				collisionPadding={4}
				alignOffset={0}
				sideOffset={0}
			>
				<div className="tlui-menu__group">
					<TlaMenuButton label="Copy link" onClick={handleCopyLinkClick} />
					<TlaMenuButton label="Rename" onClick={handleRenameLinkClick} />
					<TlaMenuButton label="Duplicate" onClick={handleDuplicateLinkClick} />
					<TlaMenuButton label="Star" onClick={handleStarLinkClick} />
				</div>
				<div className="tlui-menu__group">
					<TlaMenuButton label="Delete" onClick={handleDeleteLinkClick} />
				</div>
			</DropdownPrimitive.Content>
		</DropdownPrimitive.Root>
	)
}

function TlaMenuButton({ label, onClick }: { label: string; onClick(): void }) {
	return (
		<DropdownPrimitive.DropdownMenuItem asChild>
			<TldrawUiButton type="menu" onClick={onClick}>
				<TldrawUiButtonLabel>{label}</TldrawUiButtonLabel>
			</TldrawUiButton>
		</DropdownPrimitive.DropdownMenuItem>
	)
}

export function TlaSidebarToggle() {
	const app = useApp()
	return (
		<button className={styles.toggle} data-mobile={false} onClick={() => app.toggleSidebar()}>
			<TlaIcon icon="sidebar" />
		</button>
	)
}

export function TlaSidebarToggleMobile() {
	const app = useApp()
	return (
		<button className={styles.toggle} data-mobile={true} onClick={() => app.toggleSidebarMobile()}>
			<TlaIcon icon="sidebar" />
		</button>
	)
}
