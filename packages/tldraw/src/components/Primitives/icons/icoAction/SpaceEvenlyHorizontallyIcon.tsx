import { forwardRef } from 'react'
import { IconProps } from '../types'

export const SpaceEvenlyHorizontallyIcon = forwardRef<SVGSVGElement, IconProps>(
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
          d="M4.46 4.073a.751.751 0 0 0-.398.416c-.055.132-.062.956-.061 7.52.001 7.065.004 7.378.074 7.533.256.564 1.049.599 1.324.06.08-.158.081-.213.081-7.602s-.001-7.444-.081-7.602a.737.737 0 0 0-.939-.325m14.546-.03a.792.792 0 0 0-.407.359c-.078.153-.079.262-.079 7.598 0 7.389.001 7.444.081 7.602.275.539 1.068.504 1.324-.06.07-.155.073-.467.073-7.542 0-7.091-.003-7.386-.074-7.54-.165-.357-.588-.55-.918-.417M7.949 10.616a1.54 1.54 0 0 0-.702.573A1.817 1.817 0 0 0 7 12c0 .599.413 1.184.987 1.399.216.081.287.085 1.331.073 1.076-.012 1.107-.014 1.302-.11.278-.136.584-.438.723-.711.107-.212.117-.266.117-.651s-.01-.439-.117-.651a1.793 1.793 0 0 0-.723-.711c-.196-.096-.223-.098-1.32-.108-1.103-.01-1.123-.009-1.351.086m5.591-.041c-.363.116-.7.412-.886.779-.104.206-.114.263-.114.646 0 .385.01.439.117.651.139.273.445.575.723.711.198.097.21.098 1.36.098h1.16l.229-.108c.276-.129.581-.423.704-.678a1.505 1.505 0 0 0-.704-2.026l-.229-.108-1.1-.008c-.804-.006-1.143.005-1.26.043"
          fill={color}
          fillRule="evenodd"
        />
      </svg>
    )
  }
)
