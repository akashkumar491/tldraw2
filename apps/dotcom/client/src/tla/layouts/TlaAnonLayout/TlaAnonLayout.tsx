import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import classNames from 'classnames'
import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useValue } from 'tldraw'
import { TlaButton } from '../../components/TlaButton/TlaButton'
import { useMaybeApp } from '../../hooks/useAppState'
import styles from './anon.module.css'

export function TlaAnonLayout({ children }: { children: ReactNode }) {
	const app = useMaybeApp()
	const theme = useValue(
		'theme',
		() => {
			if (!app) return 'light'
			app.getSessionState().theme
		},
		[app]
	)

	return (
		<div
			className={classNames(
				styles.loggedOut,
				`tla tl-container ${theme === 'light' ? 'tla-theme__light tl-theme__light' : 'tla-theme__dark tl-theme__dark'}`
			)}
		>
			<div className={styles.header}>
				<Link to="/">
					<img src="/tla/tldraw-logo-2.svg" style={{ height: 20, width: 'auto' }} />
				</Link>
				<SignedOut>
					<SignInButton>
						<TlaButton>Sign in</TlaButton>
					</SignInButton>
				</SignedOut>
				<SignedIn>
					<UserButton />
				</SignedIn>
			</div>
			<div className={styles.editorWrapper}>{children}</div>
			<div className={classNames(styles.footer, 'tla-text_ui__regular')}>
				<p>
					<b>tldraw</b> is a free online whiteboard for you and your friends.{'  '}
					<Link to="/">Learn more</Link>.
				</p>
			</div>
		</div>
	)
}
