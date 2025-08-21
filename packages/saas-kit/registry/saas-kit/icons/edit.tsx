import * as React from 'react';
import { SVGProps, Ref, forwardRef } from 'react';
const SvgComponent = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        ref={ref}
        viewBox="0 0 21 21"
        {...props}
    >
        <path
            fill="currentColor"
            fillRule="evenodd"
            d="M14.892 2.818c.68-.68 1.784-.68 2.464 0l1.255 1.255c.68.68.68 1.784 0 2.464l-1.273 1.274a.506.506 0 0 1-.038.042l-6.461 6.461a.5.5 0 0 1-.101.099c-.353.33-.803.546-1.292.606l-2.31.29a.94.94 0 0 1-1.047-1.062l.321-2.279c.07-.494.298-.96.655-1.316l.005-.005 5.738-5.738a.508.508 0 0 1 .046-.054l2.038-2.037Zm-1.68 3.101-5.085 5.085 2.31 2.297 5.078-5.078-2.304-2.304Zm-10.145.43c0-.515.42-.934.935-.934h5.502a.5.5 0 0 0 0-1H4.002A1.935 1.935 0 0 0 2.067 6.35v11.006c0 1.067.867 1.934 1.935 1.934h11.005a1.935 1.935 0 0 0 1.934-1.934v-5.503a.5.5 0 1 0-1 0v5.503c0 .515-.419.934-.934.934H4.002a.935.935 0 0 1-.935-.934V6.349Z"
            clipRule="evenodd"
        />
    </svg>
);
const EditIcon = forwardRef(SvgComponent);
export default EditIcon;
