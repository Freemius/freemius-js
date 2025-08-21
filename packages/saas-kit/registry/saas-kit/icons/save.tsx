import * as React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
    <svg
        width="1em"
        height="1em"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        ref={ref}
        {...props}
    >
        <path
            d="M2.5 3.5C2.5 2.94772 2.94772 2.5 3.5 2.5H13.0858C13.351 2.5 13.6054 2.60536 13.7929 2.79289L17.2071 6.20711C17.3946 6.39464 17.5 6.649 17.5 6.91421V16.5C17.5 17.0523 17.0523 17.5 16.5 17.5H3.5C2.94772 17.5 2.5 17.0523 2.5 16.5V3.5Z"
            stroke="currentColor"
        />
        <path d="M5 13C5 12.4477 5.44772 12 6 12H14C14.5523 12 15 12.4477 15 13V18H5V13Z" fill="currentColor" />
        <path d="M13 5C13 5.55228 12.5523 6 12 6L8 6C7.44771 6 7 5.55228 7 5L7 3L13 3L13 5Z" fill="currentColor" />
    </svg>
);
const SaveIcon = forwardRef(SvgComponent);
export default SaveIcon;
