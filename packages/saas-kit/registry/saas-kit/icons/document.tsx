import * as React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 20 21"
        ref={ref}
        {...props}
    >
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.66 18.634H5.34a2.284 2.284 0 0 1-2.284-2.284V8.42c0-.297.116-.58.328-.785l5.706-5.68c.206-.206.489-.322.778-.322h4.798a2.284 2.284 0 0 1 2.284 2.284v12.427a2.284 2.284 0 0 1-2.284 2.283l-.006.007Z"
        />
        <path fill="currentColor" d="M3.41 7.963h3.983c1.13 0 2.04-.911 2.052-2.034l.025-3.941" />
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.41 7.963h3.983c1.13 0 2.04-.911 2.052-2.034l.025-3.941M6.382 11.378h7.223M6.382 14.85h7.223"
        />
    </svg>
);
const DocumentIcon = forwardRef(SvgComponent);
export default DocumentIcon;
