import { forwardRef } from 'react'
import { IconProps } from '../types'

export const AspectRatioIcon = forwardRef<SVGSVGElement, IconProps>(
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
          d="M4.664 4.063a1.005 1.005 0 0 0-.533.448L4.02 4.7v14.6l.111.189c.061.103.17.234.243.289.309.236-.173.222 7.624.222 8.025 0 7.379.025 7.703-.299.324-.324.299.322.299-7.701s.025-7.377-.299-7.701c-.324-.324.325-.299-7.718-.296-6.112.002-7.186.011-7.319.06M18.48 12.02v6.5H5.52v-13h12.96v6.5m-6.673-5.731c-.531.114-.722.836-.327 1.231.4.4 1.116.205 1.231-.337.122-.573-.327-1.018-.904-.894m-.087 2.516c-.262.104-.451.395-.451.695 0 .771.992 1.016 1.387.342.093-.159.1-.496.013-.663a.89.89 0 0 0-.402-.376.952.952 0 0 0-.547.002m.087 2.484c-.531.114-.722.836-.327 1.231.4.4 1.116.205 1.231-.337.122-.573-.327-1.018-.904-.894m2.613-.029a2.274 2.274 0 0 1-.149.037.747.747 0 0 0-.256.153.727.727 0 0 0 .491 1.281c.246 0 .413-.086.59-.305.112-.138.124-.181.124-.426s-.012-.288-.124-.426a1.092 1.092 0 0 0-.24-.219c-.117-.067-.362-.12-.436-.095m2.387.029c-.531.114-.722.836-.327 1.231.4.4 1.116.205 1.231-.337.122-.573-.327-1.018-.904-.894"
          fill={color}
          fill-rule="evenodd"
        />
      </svg>
    )
  }
)
