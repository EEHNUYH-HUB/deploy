import { useEffect, useMemo, useState } from 'react';
import { FlowLineStyle } from './flowline.style.js';
import SVG from 'react-inlinesvg'

export const toAbsoluteUrl = (pathname: string) => process.env.PUBLIC_URL + pathname

export const IConCtrl = ({type,size=16,color= FlowLineStyle.IConColor,stroke}:{type: string, size?: number, color?: string,stroke?:string}) => {
  const [path, setPath] = useState<string | null>(null);

  useEffect(() => {
    // Normalize the type to lowercase
    const lowerType = type?.toLowerCase();

    // Determine the path based on the type
    var resolvedType = lowerType;
    if (
      lowerType.includes('ui') ||
      lowerType === 'datatablectrl' ||
      lowerType === 'listctrl' ||
      lowerType === 'chartctrl' ||
      lowerType === 'treectrl' ||
      lowerType === 'viewctrl' ||
      lowerType === 'cardctrl' ||
      lowerType === 'mindmapctrl' ||
      lowerType === 'tabctrl'
    ) {
      resolvedType = 'ui';
    }

    // Update the path state
    setPath(resolvedType);
  }, [type]); // Only depend on `type`

  // Memoize the SVG component
  const svgCtrl = useMemo(() => {
    if (!path) return (<></>); // If path is null, render nothing
    return (
      <SVG
        src={toAbsoluteUrl(`/svgs/${path}.svg`)}
        fill={color}
        stroke={stroke?stroke:undefined}
        width={size}
        height={size}
        title=" "
      />
    );
  }, [path, color, size]);

  return <>{svgCtrl}</>;
};

