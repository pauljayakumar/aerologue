// web-app/src/components/ui/Icon.tsx
import React from 'react';

// Define a type for the icon names we'll use
export type IconName =
  | 'bars-3'
  | 'x-mark'
  | 'map'
  | 'paper-airplane'
  | 'arrows-right-left'
  | 'wallet'
  | 'arrow-left-on-rectangle'
  | 'user-plus';

// Map icon names to their SVG paths
const icons: Record<IconName, JSX.Element> = {
  'bars-3': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  ),
  'x-mark': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  ),
  'map': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-9.899A1.5 1.5 0 0012 4.5h-1.588a1.5 1.5 0 00-1.483 1.277L6.75 19.5m10.5-2.25L21 21m-17.25-2.25L3 21m13.5-10.5H12" />
  ),
  'paper-airplane': (
    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l4.453-1.483a1 1 0 00.644-.944v-6a1 1 0 011-1h.025a1 1 0 011 1v6c0 .308.146.596.39.784l4.454 1.483a1 1 0 001.169-1.409l-7-14z" />
  ),
  'arrows-right-left': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 7.5L21 12m0 0l-3.75 4.5M21 12H3" />
  ),
  'wallet': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15m0 0l3-3m-3 3l-3-3M21 12c0 1.335-.626 2.56-1.639 3.375a4.945 4.945 0 01-1.052.854A4.945 4.945 0 0015 15m0 0l-3 3m3-3l-3-3m0 0H5.25A2.25 2.25 0 003 14.25V18m0 0l3-3m-3 3l3 3M3 18c0 1.335.626 2.56 1.639 3.375a4.945 4.945 0 01-1.052.854A4.945 4.945 0 019 21m0 0l3-3m-3 3l3 3" />
  ),
  'arrow-left-on-rectangle': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  ),
  'user-plus': (
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.5h-1.5A2.25 2.25 0 0011.25 4.5v1.5m-2.25 0h-1.5A2.25 2.25 0 006 7.5v1.5m-2.25 0h-1.5A2.25 2.25 0 001.5 10.5v1.5" />
  ),
};

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const Icon = ({ name, ...props }: IconProps) => {
  const iconPath = icons[name];
  if (!iconPath) {
    console.warn(`Icon '${name}' not found.`);
    return null;
  }

  // Determine if the icon is 'outline' (stroke-based) or 'solid' (fill-based)
  // 'paper-airplane' is currently solid, others are outline.
  const isSolid = name === 'paper-airplane';

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24" // Assuming 24x24 for outline, adjust if needed for solid
      className={`w-6 h-6 ${props.className || ''}`}
      {...props}
      fill={isSolid ? 'currentColor' : 'none'}
      stroke={isSolid ? 'none' : 'currentColor'}
      strokeWidth={isSolid ? undefined : '1.5'}
    >
      {iconPath}
    </svg>
  );
};

export default Icon;