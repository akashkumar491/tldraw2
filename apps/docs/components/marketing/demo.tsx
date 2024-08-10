'use client'

import Image from 'next/image'
import { useState } from 'react'
import LgBc from '../../public/images/ui-placeholder/lg-bc.jpg'
import LgBl from '../../public/images/ui-placeholder/lg-bl.jpg'
import LgTl from '../../public/images/ui-placeholder/lg-tl.jpg'
import LgTr from '../../public/images/ui-placeholder/lg-tr.jpg'
import SmBc from '../../public/images/ui-placeholder/sm-bc.jpg'
import SmTl from '../../public/images/ui-placeholder/sm-tl.jpg'
import { Button } from '../common/button'

export const Demo = () => {
	const [showCanvas, setShowCanvas] = useState<boolean>(false)

	return (
		<div className="py-16 w-full">
			<div className="w-full bg-blue-500 py-1 md:rounded-2xl md:px-1 mt-1 h-96 sm:h-[40rem] max-h-[80vh]">
				<div className="relative w-full h-full md:rounded-xl overflow-hidden shadow bg-white">
					{showCanvas ? (
						<iframe
							className="iframe"
							src="https://examples.tldraw.com/develop?tldraw_preserve_focus=true"
							width="100%"
							height="100%"
						/>
					) : (
						<div className="absolute inset-0 bg-[#FBFCFE]">
							<Image
								src={LgTl}
								alt="Tldraw UI"
								className="absolute top-0 left-0 w-[345px] h-auto hidden sm:block"
							/>
							<Image
								src={LgBl}
								alt="Tldraw UI"
								className="absolute bottom-0 left-0 w-[100px] h-auto hidden sm:block"
							/>
							<Image
								src={LgBc}
								alt="Tldraw UI"
								className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[450px] h-auto hidden sm:block"
							/>
							<Image
								src={LgTr}
								alt="Tldraw UI"
								className="absolute top-0 right-0 w-[164px] h-auto hidden md:block"
							/>
							<Image
								src={SmTl}
								alt="Tldraw UI"
								className="absolute top-0 left-0 w-[164px] h-auto sm:hidden"
							/>
							<Image
								src={SmBc}
								alt="Tldraw UI"
								className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[350px] h-auto sm:hidden"
							/>
							<div className="absolute inset-0 bg-[#FBFCFE]/50 flex items-center justify-center">
								<Button
									onClick={() => setShowCanvas(true)}
									caption="Click here"
									icon="play"
									className="shadow"
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
