import * as React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 21 21"
        ref={ref}
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M18.39 5.08a1 1 0 0 1 0 1.414l-10 10a1 1 0 0 1-1.415 0l-5-5A1 1 0 1 1 3.39 10.08l4.293 4.293 9.293-9.293a1 1 0 0 1 1.415 0Z"
            clipRule="evenodd"
        />
    </svg>
);
const CheckIcon = forwardRef(SvgComponent);
export default CheckIcon;
