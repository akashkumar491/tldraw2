import * as React from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useTLDrawContext } from '~hooks'
import { DashStyle, Data } from '~types'
import { DMContent, DMTriggerIcon } from '~components/DropdownMenu'
import { ToolButton } from '~components/ToolButton'
import { DashDashedIcon, DashDottedIcon, DashDrawIcon, DashSolidIcon } from '~components/icons'

const dashes = {
  [DashStyle.Draw]: <DashDrawIcon />,
  [DashStyle.Solid]: <DashSolidIcon />,
  [DashStyle.Dashed]: <DashDashedIcon />,
  [DashStyle.Dotted]: <DashDottedIcon />,
}

const selectDash = (s: Data) => s.appState.selectedStyle.dash

export const DashMenu = React.memo((): JSX.Element => {
  const { tlstate, useSelector } = useTLDrawContext()

  const dash = useSelector(selectDash)

  return (
    <DropdownMenu.Root dir="ltr">
      <DMTriggerIcon>{dashes[dash]}</DMTriggerIcon>
      <DMContent variant="horizontal">
        {Object.keys(DashStyle).map((dashStyle) => (
          <ToolButton
            key={dashStyle}
            variant="icon"
            isActive={dash === dashStyle}
            onSelect={() => tlstate.style({ dash: dashStyle as DashStyle })}
          >
            {dashes[dashStyle as DashStyle]}
          </ToolButton>
        ))}
      </DMContent>
    </DropdownMenu.Root>
  )
})

// function DashSolidIcon(): JSX.Element {
//   return (
//     <svg width="24" height="24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
//       <circle cx={12} cy={12} r={8} fill="none" strokeWidth={2} strokeLinecap="round" />
//     </svg>
//   )
// }

// function DashDashedIcon(): JSX.Element {
//   return (
//     <svg width="24" height="24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
//       <circle
//         cx={12}
//         cy={12}
//         r={8}
//         fill="none"
//         strokeWidth={2.5}
//         strokeLinecap="round"
//         strokeDasharray={50.26548 * 0.1}
//       />
//     </svg>
//   )
// }

// const dottedDasharray = `${50.26548 * 0.025} ${50.26548 * 0.1}`

// function DashDottedIcon(): JSX.Element {
//   return (
//     <svg width="24" height="24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
//       <circle
//         cx={12}
//         cy={12}
//         r={8}
//         fill="none"
//         strokeWidth={2.5}
//         strokeLinecap="round"
//         strokeDasharray={dottedDasharray}
//       />
//     </svg>
//   )
// }

// function DashDrawIcon(): JSX.Element {
//   return (
//     <svg
//       width="24"
//       height="24"
//       viewBox="1 1.5 21 22"
//       fill="currentColor"
//       stroke="currentColor"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <path
//         d="M10.0162 19.2768C10.0162 19.2768 9.90679 19.2517 9.6879 19.2017C9.46275 19.1454 9.12816 19.0422 8.68413 18.8921C8.23384 18.7358 7.81482 18.545 7.42707 18.3199C7.03307 18.101 6.62343 17.7883 6.19816 17.3818C5.77289 16.9753 5.33511 16.3718 4.88482 15.5713C4.43453 14.7645 4.1531 13.8545 4.04053 12.8414C3.92795 11.822 4.04991 10.8464 4.40639 9.91451C4.76286 8.98266 5.39452 8.10084 6.30135 7.26906C7.21444 6.44353 8.29325 5.83377 9.5378 5.43976C10.7823 5.05202 11.833 4.92068 12.6898 5.04576C13.5466 5.16459 14.3878 5.43664 15.2133 5.86191C16.0388 6.28718 16.7768 6.8688 17.4272 7.60678C18.0714 8.34475 18.5404 9.21406 18.8344 10.2147C19.1283 11.2153 19.1721 12.2598 18.9657 13.348C18.7593 14.4299 18.2872 15.4337 17.5492 16.3593C16.8112 17.2849 15.9263 18.0072 14.8944 18.5263C13.8624 19.0391 12.9056 19.3174 12.0238 19.3612C11.142 19.405 10.2101 19.2705 9.22823 18.9578C8.24635 18.6451 7.35828 18.151 6.56402 17.4756C5.77601 16.8002 6.08871 16.8658 7.50212 17.6726C8.90927 18.4731 10.1444 18.8484 11.2076 18.7983C12.2645 18.7545 13.2965 18.4825 14.3034 17.9822C15.3102 17.4819 16.1264 16.8221 16.7518 16.0028C17.3772 15.1835 17.7681 14.3111 17.9244 13.3855C18.0808 12.4599 18.0401 11.5781 17.8025 10.74C17.5586 9.902 17.1739 9.15464 16.6486 8.49797C16.1233 7.8413 15.2289 7.27844 13.9656 6.80939C12.7086 6.34034 11.4203 6.20901 10.1007 6.41539C8.78732 6.61552 7.69599 7.06893 6.82669 7.77564C5.96363 8.48859 5.34761 9.26409 4.97863 10.1021C4.60964 10.9402 4.45329 11.8376 4.50958 12.7945C4.56586 13.7513 4.79101 14.6238 5.18501 15.4118C5.57276 16.1998 5.96363 16.8002 6.35764 17.2129C6.75164 17.6257 7.13313 17.9509 7.50212 18.1886C7.87736 18.4325 8.28074 18.642 8.71227 18.8171C9.15005 18.9922 9.47839 19.111 9.69728 19.1736C9.91617 19.2361 10.0256 19.2705 10.0256 19.2768H10.0162Z"
//         strokeWidth="2"
//       />
//     </svg>
//   )
// }
