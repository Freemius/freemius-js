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
            d="M3.4 4.93c-.673 0-1.218.546-1.218 1.218v1.39h16v-1.39c0-.672-.544-1.217-1.217-1.217H3.4Zm15.782 3.108V15.164a2.217 2.217 0 0 1-2.217 2.217H3.4a2.217 2.217 0 0 1-2.217-2.217V6.148c0-1.225.993-2.217 2.217-2.217h13.566c1.225 0 2.217.992 2.217 2.217v1.89Zm-17 3.118v4.008c0 .672.545 1.217 1.217 1.217h13.566c.672 0 1.217-.545 1.217-1.217v-4.008h-16Zm9.993 2.732a.5.5 0 0 1 .5-.5h1.49a.5.5 0 1 1 0 1h-1.49a.5.5 0 0 1-.5-.5Zm-8.044-.5a.5.5 0 0 0 0 1h6.052a.5.5 0 1 0 0-1H4.13Z"
            clipRule="evenodd"
        />
    </svg>
);
const CardIcon = forwardRef(SvgComponent);
export default CardIcon;
