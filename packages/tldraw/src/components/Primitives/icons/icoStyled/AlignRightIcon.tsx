import { forwardRef } from 'react'
import { IconProps } from '../types'

export const AlignRightIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', ...props }, forwardedRef) => {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
        ref={forwardedRef}
      >
        <path
          d="M4.413 6.804c-.473.138-.552 1.01-.12 1.332l.113.084h15.188l.113-.084c.197-.147.273-.324.273-.636s-.076-.489-.273-.636l-.113-.084-7.527-.007c-4.498-.004-7.578.009-7.654.031m6.614 4.474c-.36.071-.517.313-.499.769.014.345.08.474.316.613.134.079.208.08 4.396.08 4.07 0 4.267-.003 4.409-.074.236-.118.331-.308.331-.666 0-.358-.095-.548-.331-.666-.142-.071-.343-.074-4.309-.08-2.288-.003-4.229.008-4.313.024m-4.175 4.56c-.229.104-.332.31-.332.662 0 .358.103.559.339.664.171.075.328.077 6.455.066l6.28-.01.113-.084c.197-.147.273-.324.273-.636s-.076-.489-.273-.636l-.113-.084-6.287-.009c-6.113-.01-6.292-.008-6.455.067"
          fill-rule="evenodd"
          fill={color}
        />
      </svg>
    )
  }
)
