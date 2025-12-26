import { useRef, useMemo, useEffect, useState, Component, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Grid, 
  Html,
  GizmoHelper,
  GizmoViewcube,
  Environment,
  ContactShadows,
} from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/lib/store';
import { RAL_COLORS, WallPosition, Opening, LeanTo, Mezzanine, Canopy, Skylight } from '@shared/schema';
import { Box } from 'lucide-react';
import { AddOpeningDialog } from './AddOpeningDialog';

function checkWebGLSupport(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return gl !== null;
  } catch {
    return false;
  }
}

const WEBGL_SUPPORTED = checkWebGLSupport();

class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    if (error.message.includes('WebGL') || error.message.includes('context')) {
      console.warn('WebGL not available, showing fallback');
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function getColorHex(colorName: string): string {
  const color = RAL_COLORS.find(c => c.code === colorName || c.name === colorName);
  return color?.hex || '#888888';
}

function parseSlopeToAngle(slope: string): number {
  const parts = slope.split('/');
  if (parts.length === 2) {
    return Math.atan(parseFloat(parts[0]) / parseFloat(parts[1]));
  }
  return 0.1;
}

interface LeanToRenderProps {
  leanTo: LeanTo;
  parentWidth: number;
  parentLength: number;
  parentHeight: number;
  frameColor: string;
  visualization: { showPanels: boolean; showFrames: boolean };
}

function LeanToRenderer({ leanTo, parentWidth, parentLength, parentHeight, frameColor, visualization }: LeanToRenderProps) {
  const width = leanTo.width;
  const length = leanTo.length || parentLength;
  const height = leanTo.eaveHeight;
  const slopeAngle = parseSlopeToAngle(leanTo.slope);
  
  const xOffset = leanTo.attachedTo === 'left' 
    ? -parentWidth / 2 - width / 2 
    : parentWidth / 2 + width / 2;
  
  const wallColor = getColorHex(leanTo.colors.wallPanels);
  const roofColor = getColorHex(leanTo.colors.roofPanels);
  
  const roofPeakHeight = height + width * Math.tan(slopeAngle);

  return (
    <group position={[xOffset, 0, 0]}>
      {visualization.showPanels && (
        <>
          {/* Front Wall */}
          <mesh position={[0, height / 2 + 0.05, length / 2]} castShadow>
            <boxGeometry args={[width, height, 0.08]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Back Wall */}
          <mesh position={[0, height / 2 + 0.05, -length / 2]} castShadow>
            <boxGeometry args={[width, height, 0.08]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Outer Wall */}
          <mesh 
            position={[leanTo.attachedTo === 'left' ? -width / 2 : width / 2, height / 2 + 0.05, 0]} 
            castShadow
          >
            <boxGeometry args={[0.08, height, length]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Roof - Single slope towards outer wall */}
          <mesh 
            position={[0, height + (roofPeakHeight - height) / 2, 0]}
            rotation={[0, 0, leanTo.attachedTo === 'left' ? slopeAngle : -slopeAngle]}
            castShadow
          >
            <boxGeometry args={[width / Math.cos(slopeAngle), 0.06, length]} />
            <meshStandardMaterial color={roofColor} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {visualization.showFrames && (
        <>
          {/* Corner columns */}
          {[
            [leanTo.attachedTo === 'left' ? -width / 2 + 0.1 : width / 2 - 0.1, -length / 2 + 0.1],
            [leanTo.attachedTo === 'left' ? -width / 2 + 0.1 : width / 2 - 0.1, length / 2 - 0.1],
          ].map((pos, i) => (
            <mesh key={`leanto-col-${i}`} position={[pos[0], height / 2 + 0.05, pos[1]]} castShadow>
              <boxGeometry args={[0.15, height, 0.15]} />
              <meshStandardMaterial color={frameColor} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

interface MezzanineRenderProps {
  mezzanine: Mezzanine;
  frameColor: string;
}

function MezzanineRenderer({ mezzanine, frameColor }: MezzanineRenderProps) {
  const { position, dimensions, height, hasRailing } = mezzanine;
  
  return (
    <group position={[position.x, height, position.z]}>
      {/* Floor deck */}
      <mesh castShadow>
        <boxGeometry args={[dimensions.width, 0.15, dimensions.length]} />
        <meshStandardMaterial color="#A0A0A0" />
      </mesh>

      {/* Support columns */}
      {[
        [-dimensions.width / 2 + 0.15, -dimensions.length / 2 + 0.15],
        [dimensions.width / 2 - 0.15, -dimensions.length / 2 + 0.15],
        [-dimensions.width / 2 + 0.15, dimensions.length / 2 - 0.15],
        [dimensions.width / 2 - 0.15, dimensions.length / 2 - 0.15],
      ].map((pos, i) => (
        <mesh key={`mezz-col-${i}`} position={[pos[0], -height / 2, pos[1]]} castShadow>
          <boxGeometry args={[0.2, height, 0.2]} />
          <meshStandardMaterial color={frameColor} />
        </mesh>
      ))}

      {/* Railings */}
      {hasRailing && (
        <>
          {/* Front railing */}
          <mesh position={[0, 0.55, dimensions.length / 2 - 0.05]}>
            <boxGeometry args={[dimensions.width, 0.05, 0.05]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
          {/* Back railing */}
          <mesh position={[0, 0.55, -dimensions.length / 2 + 0.05]}>
            <boxGeometry args={[dimensions.width, 0.05, 0.05]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
          {/* Side railings */}
          <mesh position={[-dimensions.width / 2 + 0.05, 0.55, 0]}>
            <boxGeometry args={[0.05, 0.05, dimensions.length]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
          <mesh position={[dimensions.width / 2 - 0.05, 0.55, 0]}>
            <boxGeometry args={[0.05, 0.05, dimensions.length]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>

          {/* Railing posts */}
          {[
            [-dimensions.width / 2 + 0.05, -dimensions.length / 2 + 0.05],
            [dimensions.width / 2 - 0.05, -dimensions.length / 2 + 0.05],
            [-dimensions.width / 2 + 0.05, dimensions.length / 2 - 0.05],
            [dimensions.width / 2 - 0.05, dimensions.length / 2 - 0.05],
          ].map((pos, i) => (
            <mesh key={`railing-post-${i}`} position={[pos[0], 0.3, pos[1]]}>
              <boxGeometry args={[0.05, 0.5, 0.05]} />
              <meshStandardMaterial color={frameColor} />
            </mesh>
          ))}
        </>
      )}
    </group>
  );
}

interface CanopyRenderProps {
  canopy: Canopy;
  buildingWidth: number;
  buildingLength: number;
  buildingHeight: number;
}

function CanopyRenderer({ canopy, buildingWidth, buildingLength, buildingHeight }: CanopyRenderProps) {
  const { wall, dimensions } = canopy;
  const color = getColorHex(canopy.color);
  
  let position: [number, number, number] = [0, 0, 0];
  let rotation: [number, number, number] = [0, 0, 0];
  let size: [number, number, number] = [0, 0, 0];
  
  switch (wall) {
    case 'front':
      position = [canopy.position.x, buildingHeight - 0.5, buildingLength / 2 + dimensions.projection / 2];
      size = [dimensions.width, 0.08, dimensions.projection];
      rotation = [-0.1, 0, 0];
      break;
    case 'back':
      position = [canopy.position.x, buildingHeight - 0.5, -buildingLength / 2 - dimensions.projection / 2];
      size = [dimensions.width, 0.08, dimensions.projection];
      rotation = [0.1, 0, 0];
      break;
    case 'left':
      position = [-buildingWidth / 2 - dimensions.projection / 2, buildingHeight - 0.5, canopy.position.x];
      size = [dimensions.projection, 0.08, dimensions.width];
      rotation = [0, 0, -0.1];
      break;
    case 'right':
      position = [buildingWidth / 2 + dimensions.projection / 2, buildingHeight - 0.5, canopy.position.x];
      size = [dimensions.projection, 0.08, dimensions.width];
      rotation = [0, 0, 0.1];
      break;
  }

  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
      
      {canopy.hasSupportColumns && (
        <>
          {/* Support columns */}
          {wall === 'front' || wall === 'back' ? (
            <>
              <mesh position={[-dimensions.width / 2 + 0.1, -buildingHeight / 3, 0]}>
                <boxGeometry args={[0.1, buildingHeight * 0.6, 0.1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
              <mesh position={[dimensions.width / 2 - 0.1, -buildingHeight / 3, 0]}>
                <boxGeometry args={[0.1, buildingHeight * 0.6, 0.1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            </>
          ) : (
            <>
              <mesh position={[0, -buildingHeight / 3, -dimensions.width / 2 + 0.1]}>
                <boxGeometry args={[0.1, buildingHeight * 0.6, 0.1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
              <mesh position={[0, -buildingHeight / 3, dimensions.width / 2 - 0.1]}>
                <boxGeometry args={[0.1, buildingHeight * 0.6, 0.1]} />
                <meshStandardMaterial color="#666666" />
              </mesh>
            </>
          )}
        </>
      )}
    </group>
  );
}

interface SkylightRenderProps {
  skylight: Skylight;
  roofHeight: number;
}

function SkylightRenderer({ skylight, roofHeight }: SkylightRenderProps) {
  return (
    <mesh position={[skylight.position.x, roofHeight + 0.1, skylight.position.y]} castShadow>
      <boxGeometry args={[skylight.dimensions.width, 0.1, skylight.dimensions.length]} />
      <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
    </mesh>
  );
}

interface BuildingProps {
  onAddOpening?: (wall: WallPosition) => void;
}

function Building({ onAddOpening }: BuildingProps) {
  const { buildingConfig, visualization, viewMode } = useConfiguratorStore();
  const groupRef = useRef<THREE.Group>(null);
  
  if (!buildingConfig) return null;

  const { dimensions, roof, colors, bays } = buildingConfig;
  const width = dimensions.width;
  const length = dimensions.length;
  const height = dimensions.eaveHeight;
  const slopeAngle = parseSlopeToAngle(roof.slope);
  
  const peakHeight = roof.type === 'double_slope' 
    ? height + (width / 2) * Math.tan(slopeAngle)
    : height + width * Math.tan(slopeAngle);

  const wallColor = getColorHex(colors.wallPanels);
  const roofColor = getColorHex(colors.roofPanels);
  const frameColor = getColorHex(colors.primaryStructure);
  const secondaryFrameColor = getColorHex(colors.secondaryStructure);
  const basePlateColor = getColorHex(colors.basePlate);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Base Plate */}
      {visualization.showBasePlate && (
        <mesh position={[0, 0.025, 0]} receiveShadow>
          <boxGeometry args={[width + 0.4, 0.05, length + 0.4]} />
          <meshStandardMaterial color={basePlateColor} />
        </mesh>
      )}

      {/* Ground Slab */}
      <mesh position={[0, 0.01, 0]} receiveShadow>
        <boxGeometry args={[width + 2, 0.02, length + 2]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Walls */}
      {visualization.showPanels && (
        <>
          {/* Front Wall */}
          <mesh position={[0, height / 2 + 0.05, length / 2]} castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.1]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Back Wall */}
          <mesh position={[0, height / 2 + 0.05, -length / 2]} castShadow receiveShadow>
            <boxGeometry args={[width, height, 0.1]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Left Wall */}
          <mesh position={[-width / 2, height / 2 + 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, height, length]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>

          {/* Right Wall */}
          <mesh position={[width / 2, height / 2 + 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.1, height, length]} />
            <meshStandardMaterial color={wallColor} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}

      {/* Roof */}
      {visualization.showPanels && (
        <>
          {roof.type === 'double_slope' ? (
            <>
              {/* Left Roof Panel */}
              <mesh 
                position={[-width / 4, height + (peakHeight - height) / 2, 0]}
                rotation={[0, 0, slopeAngle]}
                castShadow
              >
                <boxGeometry args={[width / 2 / Math.cos(slopeAngle), 0.08, length]} />
                <meshStandardMaterial color={roofColor} side={THREE.DoubleSide} />
              </mesh>

              {/* Right Roof Panel */}
              <mesh 
                position={[width / 4, height + (peakHeight - height) / 2, 0]}
                rotation={[0, 0, -slopeAngle]}
                castShadow
              >
                <boxGeometry args={[width / 2 / Math.cos(slopeAngle), 0.08, length]} />
                <meshStandardMaterial color={roofColor} side={THREE.DoubleSide} />
              </mesh>
            </>
          ) : (
            /* Single Slope Roof */
            <mesh 
              position={[0, height + (peakHeight - height) / 2, 0]}
              rotation={[0, 0, roof.orientation === 'right' ? -slopeAngle : slopeAngle]}
              castShadow
            >
              <boxGeometry args={[width / Math.cos(slopeAngle), 0.08, length]} />
              <meshStandardMaterial color={roofColor} side={THREE.DoubleSide} />
            </mesh>
          )}
        </>
      )}

      {/* Primary Frames */}
      {visualization.showFrames && (
        <>
          {/* Corner Columns */}
          {[
            [-width / 2 + 0.1, 0, -length / 2 + 0.1],
            [width / 2 - 0.1, 0, -length / 2 + 0.1],
            [-width / 2 + 0.1, 0, length / 2 - 0.1],
            [width / 2 - 0.1, 0, length / 2 - 0.1],
          ].map((pos, i) => (
            <mesh key={`column-${i}`} position={[pos[0], height / 2 + 0.05, pos[2]]} castShadow>
              <boxGeometry args={[0.2, height, 0.2]} />
              <meshStandardMaterial color={frameColor} />
            </mesh>
          ))}

          {/* Interior Frame Columns - Based on bays */}
          {bays && bays.length > 1 && (() => {
            let zPos = -length / 2;
            const columns: JSX.Element[] = [];
            
            bays.slice(0, -1).forEach((bay, i) => {
              zPos += bay.width;
              columns.push(
                <mesh key={`int-col-left-${i}`} position={[-width / 2 + 0.1, height / 2 + 0.05, zPos]} castShadow>
                  <boxGeometry args={[0.2, height, 0.2]} />
                  <meshStandardMaterial color={frameColor} />
                </mesh>,
                <mesh key={`int-col-right-${i}`} position={[width / 2 - 0.1, height / 2 + 0.05, zPos]} castShadow>
                  <boxGeometry args={[0.2, height, 0.2]} />
                  <meshStandardMaterial color={frameColor} />
                </mesh>
              );
            });
            
            return columns;
          })()}

          {/* Horizontal Beams (Rafters) */}
          <mesh position={[0, height + 0.1, -length / 2 + 0.1]} castShadow>
            <boxGeometry args={[width, 0.2, 0.15]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
          <mesh position={[0, height + 0.1, length / 2 - 0.1]} castShadow>
            <boxGeometry args={[width, 0.2, 0.15]} />
            <meshStandardMaterial color={frameColor} />
          </mesh>
        </>
      )}

      {/* Purlins (Secondary roof structure) */}
      {visualization.showPurlins && (
        <>
          {Array.from({ length: Math.floor(length / 1.5) }).map((_, i) => (
            <mesh key={`purlin-${i}`} position={[0, peakHeight - 0.1, -length / 2 + (i + 1) * 1.5]} castShadow>
              <boxGeometry args={[width - 0.3, 0.08, 0.08]} />
              <meshStandardMaterial color={secondaryFrameColor} />
            </mesh>
          ))}
        </>
      )}

      {/* Girts (Secondary wall structure) */}
      {visualization.showGirts && (
        <>
          {/* Front and back wall girts */}
          {[length / 2 - 0.05, -length / 2 + 0.05].map((zPos, wallIdx) => (
            Array.from({ length: Math.floor(height / 1.5) }).map((_, i) => (
              <mesh key={`girt-fb-${wallIdx}-${i}`} position={[0, (i + 1) * 1.5, zPos]} castShadow>
                <boxGeometry args={[width - 0.3, 0.06, 0.06]} />
                <meshStandardMaterial color={secondaryFrameColor} />
              </mesh>
            ))
          ))}
          {/* Side wall girts */}
          {[-width / 2 + 0.05, width / 2 - 0.05].map((xPos, wallIdx) => (
            Array.from({ length: Math.floor(height / 1.5) }).map((_, i) => (
              <mesh key={`girt-side-${wallIdx}-${i}`} position={[xPos, (i + 1) * 1.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
                <boxGeometry args={[length - 0.3, 0.06, 0.06]} />
                <meshStandardMaterial color={secondaryFrameColor} />
              </mesh>
            ))
          ))}
        </>
      )}

      {/* Dimensions */}
      {visualization.showDimensions && (
        <>
          {/* Width Dimension */}
          <Html position={[0, -0.5, length / 2 + 1.5]} center>
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono border whitespace-nowrap">
              Width: {width.toFixed(2)}m
            </div>
          </Html>

          {/* Length Dimension */}
          <Html position={[width / 2 + 1.5, -0.5, 0]} center>
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono border whitespace-nowrap">
              Length: {length.toFixed(2)}m
            </div>
          </Html>

          {/* Height Dimension */}
          <Html position={[-width / 2 - 1.5, height / 2, -length / 2]} center>
            <div className="bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-mono border whitespace-nowrap">
              Height: {height.toFixed(2)}m
            </div>
          </Html>
        </>
      )}

      {/* Interactive Buttons on walls */}
      {visualization.showButtons && (
        <>
          {/* Front Wall Button */}
          <Html position={[0, height / 2, length / 2 + 0.2]} center>
            <button 
              className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center text-lg font-bold shadow-lg hover:bg-[#e8850f] hover:scale-110 transition-all"
              data-testid="button-add-opening-front"
              onClick={() => onAddOpening?.('front')}
            >
              +
            </button>
          </Html>

          {/* Back Wall Button */}
          <Html position={[0, height / 2, -length / 2 - 0.2]} center>
            <button 
              className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center text-lg font-bold shadow-lg hover:bg-[#e8850f] hover:scale-110 transition-all"
              data-testid="button-add-opening-back"
              onClick={() => onAddOpening?.('back')}
            >
              +
            </button>
          </Html>

          {/* Left Wall Button */}
          <Html position={[-width / 2 - 0.2, height / 2, 0]} center>
            <button 
              className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center text-lg font-bold shadow-lg hover:bg-[#e8850f] hover:scale-110 transition-all"
              data-testid="button-add-opening-left"
              onClick={() => onAddOpening?.('left')}
            >
              +
            </button>
          </Html>

          {/* Right Wall Button */}
          <Html position={[width / 2 + 0.2, height / 2, 0]} center>
            <button 
              className="w-8 h-8 rounded-full bg-[#F7941D] text-white flex items-center justify-center text-lg font-bold shadow-lg hover:bg-[#e8850f] hover:scale-110 transition-all"
              data-testid="button-add-opening-right"
              onClick={() => onAddOpening?.('right')}
            >
              +
            </button>
          </Html>
        </>
      )}

      {/* Render openings on walls */}
      {visualization.showOpenings && buildingConfig.openings.map((opening) => {
        const openingColor = getColorHex(opening.color);
        let position: [number, number, number] = [0, 0, 0];
        let rotation: [number, number, number] = [0, 0, 0];
        
        switch (opening.wall) {
          case 'front':
            position = [opening.position.x, opening.position.y + opening.dimensions.height / 2 + 0.05, length / 2 + 0.06];
            break;
          case 'back':
            position = [opening.position.x, opening.position.y + opening.dimensions.height / 2 + 0.05, -length / 2 - 0.06];
            break;
          case 'left':
            position = [-width / 2 - 0.06, opening.position.y + opening.dimensions.height / 2 + 0.05, opening.position.x];
            rotation = [0, Math.PI / 2, 0];
            break;
          case 'right':
            position = [width / 2 + 0.06, opening.position.y + opening.dimensions.height / 2 + 0.05, opening.position.x];
            rotation = [0, Math.PI / 2, 0];
            break;
        }
        
        const isWindow = opening.type === 'window';
        const isGlass = isWindow || opening.type === 'sliding_door';
        
        return (
          <group key={opening.id} position={position} rotation={rotation}>
            <mesh>
              <boxGeometry args={[opening.dimensions.width, opening.dimensions.height, 0.12]} />
              <meshStandardMaterial 
                color={isGlass ? '#87CEEB' : openingColor} 
                transparent={isGlass}
                opacity={isGlass ? 0.6 : 1}
              />
            </mesh>
            {isWindow && (
              <mesh position={[0, 0, 0.07]}>
                <boxGeometry args={[opening.dimensions.width - 0.1, opening.dimensions.height - 0.1, 0.02]} />
                <meshStandardMaterial color="#B0E0E6" transparent opacity={0.4} />
              </mesh>
            )}
            {/* Door Frame */}
            {opening.hasFrame && !isWindow && (
              <>
                <mesh position={[-opening.dimensions.width / 2 - 0.05, 0, 0]}>
                  <boxGeometry args={[0.1, opening.dimensions.height + 0.1, 0.15]} />
                  <meshStandardMaterial color={opening.frameColor ? getColorHex(opening.frameColor) : frameColor} />
                </mesh>
                <mesh position={[opening.dimensions.width / 2 + 0.05, 0, 0]}>
                  <boxGeometry args={[0.1, opening.dimensions.height + 0.1, 0.15]} />
                  <meshStandardMaterial color={opening.frameColor ? getColorHex(opening.frameColor) : frameColor} />
                </mesh>
                <mesh position={[0, opening.dimensions.height / 2 + 0.05, 0]}>
                  <boxGeometry args={[opening.dimensions.width + 0.2, 0.1, 0.15]} />
                  <meshStandardMaterial color={opening.frameColor ? getColorHex(opening.frameColor) : frameColor} />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* Render Lean-Tos */}
      {buildingConfig.leanTos && buildingConfig.leanTos.map((leanTo) => (
        <LeanToRenderer
          key={leanTo.id}
          leanTo={leanTo}
          parentWidth={width}
          parentLength={length}
          parentHeight={height}
          frameColor={frameColor}
          visualization={visualization}
        />
      ))}

      {/* Render Mezzanines */}
      {buildingConfig.mezzanines && buildingConfig.mezzanines.map((mezzanine) => (
        <MezzanineRenderer
          key={mezzanine.id}
          mezzanine={mezzanine}
          frameColor={frameColor}
        />
      ))}

      {/* Render Canopies */}
      {buildingConfig.canopies && buildingConfig.canopies.map((canopy) => (
        <CanopyRenderer
          key={canopy.id}
          canopy={canopy}
          buildingWidth={width}
          buildingLength={length}
          buildingHeight={height}
        />
      ))}

      {/* Render Skylights */}
      {buildingConfig.skylights && buildingConfig.skylights.map((skylight) => (
        <SkylightRenderer
          key={skylight.id}
          skylight={skylight}
          roofHeight={peakHeight}
        />
      ))}

      {/* Render Crane (if exists) */}
      {buildingConfig.crane && buildingConfig.crane.type !== 'none' && (
        <group>
          {/* Crane runway beams */}
          <mesh position={[-width / 2 + 1, height - 0.5, 0]} castShadow>
            <boxGeometry args={[0.3, 0.4, length - 2]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          <mesh position={[width / 2 - 1, height - 0.5, 0]} castShadow>
            <boxGeometry args={[0.3, 0.4, length - 2]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
          
          {/* Crane bridge */}
          <mesh position={[0, height - 0.3, 0]} castShadow>
            <boxGeometry args={[width - 2.5, 0.5, 0.8]} />
            <meshStandardMaterial color="#FF8C00" />
          </mesh>
          
          {/* Hoist trolley */}
          <mesh position={[0, height - 0.8, 0]} castShadow>
            <boxGeometry args={[1, 0.4, 0.6]} />
            <meshStandardMaterial color="#FF6600" />
          </mesh>
          
          {/* Hook */}
          <mesh position={[0, (buildingConfig.crane.hookHeight || height - 2), 0]} castShadow>
            <boxGeometry args={[0.2, 0.3, 0.2]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function CameraController() {
  const { viewMode } = useConfiguratorStore();
  const { camera } = useThree();
  
  useEffect(() => {
    const distance = 40;
    switch (viewMode) {
      case '3D':
        camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
        break;
      case '+Y':
        camera.position.set(0, distance, 0);
        break;
      case '-Y':
        camera.position.set(0, -distance, 0);
        break;
      case '+X':
        camera.position.set(distance, distance * 0.3, 0);
        break;
      case '-X':
        camera.position.set(-distance, distance * 0.3, 0);
        break;
      case '-Z':
        camera.position.set(0, distance * 0.3, distance);
        break;
    }
    camera.lookAt(0, 5, 0);
  }, [viewMode, camera]);

  return null;
}

function ViewportFallback() {
  const { buildingConfig } = useConfiguratorStore();
  
  if (!buildingConfig) return null;
  
  const { dimensions, roof } = buildingConfig;
  
  return (
    <div className="flex-1 bg-gradient-to-b from-muted/20 to-muted/40 flex flex-col items-center justify-center" data-testid="viewport-fallback">
      <Box className="w-24 h-24 text-muted-foreground/30 mb-4" />
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-medium mb-2">3D Preview</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Interactive 3D visualization requires WebGL support
        </p>
        <div className="bg-card border rounded-lg p-4 text-left text-sm">
          <h4 className="font-medium mb-2">Building Configuration:</h4>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Width:</span>
              <span className="font-mono" data-testid="fallback-width">{dimensions.width}m</span>
            </div>
            <div className="flex justify-between">
              <span>Length:</span>
              <span className="font-mono">{dimensions.length}m</span>
            </div>
            <div className="flex justify-between">
              <span>Eave Height:</span>
              <span className="font-mono">{dimensions.eaveHeight}m</span>
            </div>
            <div className="flex justify-between">
              <span>Roof Type:</span>
              <span className="capitalize">{roof.type.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Viewport3D() {
  const { buildingConfig } = useConfiguratorStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWall, setSelectedWall] = useState<WallPosition>('front');

  const handleAddOpening = (wall: WallPosition) => {
    setSelectedWall(wall);
    setDialogOpen(true);
  };

  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ wall: WallPosition }>;
      if (customEvent.detail && customEvent.detail.wall) {
        setSelectedWall(customEvent.detail.wall);
        setDialogOpen(true);
      }
    };
    window.addEventListener('openAddOpeningDialog', handleCustomEvent);
    return () => {
      window.removeEventListener('openAddOpeningDialog', handleCustomEvent);
    };
  }, []);

  if (!buildingConfig) {
    return (
      <div className="flex-1 bg-muted/30 flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Loading building configuration...</p>
        </div>
      </div>
    );
  }

  if (!WEBGL_SUPPORTED) {
    return (
      <>
        <ViewportFallback />
        <AddOpeningDialog open={dialogOpen} onOpenChange={setDialogOpen} wall={selectedWall} />
      </>
    );
  }

  return (
    <div className="flex-1 relative bg-gradient-to-b from-muted/20 to-muted/40" data-testid="viewport-3d">
      <WebGLErrorBoundary fallback={<ViewportFallback />}>
        <Canvas
        shadows
        camera={{ position: [30, 20, 30], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <CameraController />
        
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[20, 30, 20]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={100}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
        />
        <directionalLight position={[-10, 10, -10]} intensity={0.3} />

        {/* Environment */}
        <Environment preset="city" />

        {/* Grid */}
        <Grid 
          args={[100, 100]} 
          cellSize={1} 
          cellThickness={0.5} 
          cellColor="#888888"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#666666"
          fadeDistance={80}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        {/* Building Model */}
        <Building onAddOpening={handleAddOpening} />

        {/* Contact Shadows */}
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.4}
          scale={100}
          blur={2}
          far={20}
        />

        {/* Controls */}
        <OrbitControls 
          makeDefault
          enableDamping
          dampingFactor={0.05}
          minDistance={10}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 5, 0]}
        />

        {/* Gizmo Viewcube */}
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewcube 
            color="#888888"
            textColor="#ffffff"
            strokeColor="#333333"
            hoverColor="#F7941D"
          />
        </GizmoHelper>
      </Canvas>
      </WebGLErrorBoundary>

      {/* Axis Labels Overlay */}
      <div className="absolute bottom-4 left-4 flex items-end gap-2 pointer-events-none">
        <div className="flex flex-col gap-1 text-xs font-mono">
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-red-500" />
            <span className="text-red-500">X</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-green-500" />
            <span className="text-green-500">Y</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-blue-500" />
            <span className="text-blue-500">Z</span>
          </div>
        </div>
      </div>

      {/* Instructions Overlay */}
      <div className="absolute top-4 left-4 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-2 rounded-md border">
        <p>Drag to rotate | Scroll to zoom | Right-click to pan</p>
      </div>

      {/* Add Opening Dialog */}
      <AddOpeningDialog open={dialogOpen} onOpenChange={setDialogOpen} wall={selectedWall} />
    </div>
  );
}
