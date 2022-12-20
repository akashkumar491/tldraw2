import { forwardRef } from 'react'
import { IconProps } from '../types'

export const Trash2Icon = forwardRef<SVGSVGElement, IconProps>(
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
          d="M10.84 4.265a1.783 1.783 0 0 0-1.339.85c-.137.221-.209.467-.244.835l-.027.29-1.625.002c-.894.001-1.703.017-1.799.035-.363.07-.538.305-.538.723 0 .473.207.695.694.743l.276.027.012 5.285c.011 4.776.019 5.303.078 5.471.142.402.429.754.792.971.425.254.208.243 4.88.243s4.455.011 4.88-.243a1.87 1.87 0 0 0 .792-.971c.059-.168.067-.7.078-5.471l.013-5.285.276-.027c.486-.048.693-.27.693-.743 0-.418-.175-.653-.538-.723-.096-.018-.906-.034-1.8-.035l-1.626-.002-.027-.29c-.037-.394-.109-.625-.273-.877a1.745 1.745 0 0 0-.582-.571c-.349-.217-.451-.231-1.726-.243a29.52 29.52 0 0 0-1.32.006m2.327 1.561c.049.045.073.123.073.24v.174h-2.48v-.167c0-.317-.016-.313 1.233-.313.968 0 1.11.008 1.174.066m3.073 7.101c0 4.752-.005 5.173-.066 5.24-.064.07-.245.073-4.167.073-3.76 0-4.107-.006-4.174-.066-.07-.064-.073-.279-.073-5.24V7.76h8.48v5.167m-7.013-2.649a.607.607 0 0 0-.437.325c-.066.127-.07.308-.06 2.444.01 2.275.011 2.309.094 2.42.143.192.312.265.616.265.329 0 .542-.096.66-.296.077-.132.08-.208.08-2.436 0-2.228-.003-2.304-.08-2.436-.136-.232-.515-.356-.873-.286m2.56 0a.659.659 0 0 0-.447.326c-.077.132-.08.208-.08 2.396 0 2.188.003 2.264.08 2.396.161.273.478.396.845.327a.646.646 0 0 0 .475-.327c.077-.13.081-.22.093-2.176.007-1.122.001-2.152-.013-2.289-.042-.405-.244-.62-.62-.662a1.307 1.307 0 0 0-.333.009m2.542.004a.91.91 0 0 0-.285.115c-.226.161-.224.143-.224 2.623 0 2.208.003 2.284.08 2.416.118.2.331.296.66.296.304 0 .473-.073.616-.265.083-.112.084-.136.084-2.467s-.001-2.355-.084-2.467c-.168-.225-.494-.321-.847-.251"
          fillRule="evenodd"
          fill={color}
        />
      </svg>
    )
  }
)
