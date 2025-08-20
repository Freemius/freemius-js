import { SVGProps } from 'react';

export default function FSSymbol(props: SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 21 21" fill="none" {...props}>
            <g fill="currentColor" clipPath="url(#a)">
                <path d="M4.611 7.186c0-.293.157-.563.411-.709L14.697.924a.462.462 0 0 1 .692.4v3.3a.818.818 0 0 1-.41.71l-9.675 5.552a.462.462 0 0 1-.693-.4v-3.3ZM4.61 12.88c0-.292.156-.562.408-.708l6.174-3.582a.462.462 0 0 1 .694.4v3.297a.818.818 0 0 1-.407.708l-6.174 3.581a.462.462 0 0 1-.694-.4V12.88ZM5.404 18.477a.462.462 0 0 1-.036-.817l2.87-1.677a.462.462 0 0 1 .695.4v3.034c0 .34-.354.563-.66.418l-2.87-1.358Z" />
            </g>
            <defs>
                <clipPath id="a">
                    <path fill="currentColor" d="M0 .337h20v20H0z" />
                </clipPath>
            </defs>
        </svg>
    );
}
