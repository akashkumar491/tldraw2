// 'use client'

import { cn } from '@/utils/cn'
import { DetailedHTMLProps, HTMLAttributes } from 'react'

export function Pre(props: DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>) {
	// const container = useRef<HTMLPreElement>(null)
	// const [copied, setCopied] = useState<boolean>(false)
	// const copy = () => {
	// 	const code: string = container.current?.innerText ?? ''
	// 	navigator.clipboard.writeText(code)
	// 	setCopied(true)
	// 	setTimeout(() => setCopied(false), 1500)
	// }
	return (
		<div
			className={cn(
				'group relative not-prose bg-zinc-100 dark:bg-zinc-800 py-1 md:rounded-2xl -mx-5 md:-mx-1 md:px-1 my-6',
				'[td_&]:m-0 [td_&]:mb-2 [td_&]:p-0 [td_&]:bg-transparent [td_&]:rounded-none dark:[td_&]:rounded-lg'
			)}
		>
			<pre
				// ref={container}
				className={cn(
					'bg-zinc-900 text-sm text-white shadow md:rounded-xl overflow-x-auto px-5 md:px-4 py-4',
					'[td_&]:bg-zinc-200 dark:[td_&]:bg-zinc-800 [td_&]:shadow-none [td_&]:rounded-lg [td_&]:p-0 [td_&]:px-1.5'
				)}
			>
				{props.children}
			</pre>
			{/* <Button
                onClick={copy}
                caption={copied ? 'Copied' : 'Copy'}
                icon={copied ? 'check' : 'paperclip'}
                size="xs"
                className="absolute -top-2 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-100"
            /> */}
		</div>
	)
}
