import { z } from "zod";

// RAL Color definitions
export const RAL_COLORS = [
  { code: "RAL 9010", name: "Pure White", hex: "#FFFFFF" },
  { code: "RAL 9006", name: "White Aluminum", hex: "#A5A5A5" },
  { code: "RAL 9007", name: "Grey Aluminum", hex: "#8F8F8F" },
  { code: "RAL 7035", name: "Light Grey", hex: "#D7D7D7" },
  { code: "RAL 3011", name: "Brown Red", hex: "#781F19" },
  { code: "RAL 1002", name: "Sand Yellow", hex: "#C6A664" },
  { code: "RAL 5010", name: "Gentian Blue", hex: "#0E518D" },
  { code: "RAL 6005", name: "Moss Green", hex: "#2F4538" },
  { code: "RAL 7016", name: "Anthracite Grey", hex: "#293133" },
  { code: "RAL 8017", name: "Chocolate Brown", hex: "#45322E" },
  { code: "Arctic White", name: "Arctic White", hex: "#F4F4F4" },
  { code: "RAL 9002", name: "Grey White", hex: "#E7EBDA" },
  { code: "RAL 1015", name: "Light Ivory", hex: "#E6D2B5" },
  { code: "RAL 3000", name: "Flame Red", hex: "#AF2B1E" },
  { code: "RAL 5015", name: "Sky Blue", hex: "#2271B3" },
] as const;

export type RalColor = typeof RAL_COLORS[number];

// Building template types
export const templateTypes = ["single_slope", "rigid_frame", "leans_to"] as const;
export type TemplateType = typeof templateTypes[number];

// Building templates
export const buildingTemplates = [
  {
    id: "single_slope",
    name: "Single Slope Building",
    description: "Mono-pitch roof design ideal for industrial applications with efficient drainage",
    type: "single_slope" as TemplateType,
    minWidth: 6,
    maxWidth: 18,
    defaultWidth: 12,
    defaultRoofType: "single_slope",
  },
  {
    id: "rigid_frame",
    name: "Rigid Frame Building",
    description: "Traditional gabled double-slope roof for maximum interior clearance",
    type: "rigid_frame" as TemplateType,
    minWidth: 6,
    maxWidth: 100,
    defaultWidth: 24,
    defaultRoofType: "double_slope",
  },
  {
    id: "leans_to",
    name: "Building with Leans To",
    description: "Multiple connected buildings for expanded facilities and flexible layouts",
    type: "leans_to" as TemplateType,
    minWidth: 12,
    maxWidth: 100,
    defaultWidth: 30,
    defaultRoofType: "double_slope",
  },
] as const;

export type BuildingTemplate = typeof buildingTemplates[number];

// Roof types
export const roofTypes = ["single_slope", "double_slope"] as const;
export type RoofType = typeof roofTypes[number];

// Roof orientations
export const roofOrientations = ["left", "right"] as const;
export type RoofOrientation = typeof roofOrientations[number];

// Slope options
export const slopeOptions = [
  "0.5/10", "1/10", "1.5/10", "2/10", "2.5/10", "3/10", "3.5/10", "4/10", "4.5/10", "5/10"
] as const;
export type SlopeOption = typeof slopeOptions[number];

// Frame types
export const frameTypes = [
  { id: "RF", name: "RF: Rigid Frame" },
  { id: "CF", name: "CF: Clear Span" },
  { id: "MF", name: "MF: Multi-Span" },
] as const;

// End wall types
export const endWallTypes = [
  { id: "bearing_frame", name: "Bearing Frame" },
  { id: "post_beam", name: "Post & Beam" },
] as const;

// Opening types - Enhanced
export const openingTypes = ["window", "door", "sliding_door", "roll_door", "sectional_door", "personnel_door", "emergency_exit", "louver", "framed_opening"] as const;
export type OpeningType = typeof openingTypes[number];

// Door swing directions
export const doorSwingDirections = ["left_in", "left_out", "right_in", "right_out"] as const;
export type DoorSwingDirection = typeof doorSwingDirections[number];

// Wall positions
export const wallPositions = ["front", "back", "left", "right", "roof"] as const;
export type WallPosition = typeof wallPositions[number];

// Accessory types - Enhanced
export const accessoryTypes = ["vent", "canopy", "reflector", "gutter", "downspout", "ridge_vent", "turbine_vent", "wall_louver", "fascia"] as const;
export type AccessoryType = typeof accessoryTypes[number];

// Insulation types
export const insulationTypes = ["none", "fiberglass_blanket", "rigid_board", "spray_foam", "reflective"] as const;
export type InsulationType = typeof insulationTypes[number];

// Insulation R-values
export const insulationRValues = ["R-10", "R-13", "R-19", "R-25", "R-30", "R-38"] as const;
export type InsulationRValue = typeof insulationRValues[number];

// Panel types
export const panelTypes = ["single_skin", "sandwich_panel", "standing_seam", "corrugated"] as const;
export type PanelType = typeof panelTypes[number];

// Panel profiles
export const panelProfiles = ["KR-24", "KR-36", "KW-24", "KW-36", "Kirby Rib", "Kirby Wall"] as const;
export type PanelProfile = typeof panelProfiles[number];

// Crane types
export const craneTypes = ["none", "overhead_bridge", "monorail", "jib", "gantry"] as const;
export type CraneType = typeof craneTypes[number];

// Skylight types
export const skylightTypes = ["single", "continuous", "ridge"] as const;
export type SkylightType = typeof skylightTypes[number];

// Ventilation types
export const ventilationTypes = ["ridge_vent", "turbine_vent", "wall_louver", "powered_exhaust"] as const;
export type VentilationType = typeof ventilationTypes[number];

// Building sectors
export const buildingSectors = [
  "Industrial", "Commercial", "Agricultural", "Recreational", "Aviation", "Warehouse", "Other"
] as const;

// Building applications
export const buildingApplications = [
  "Plants/Factories", "Warehouses", "Distribution Centers", "Manufacturing", 
  "Cold Storage", "Aircraft Hangars", "Sports Facilities", "Retail", "Other"
] as const;

// Bay configuration
export const baySchema = z.object({
  id: z.string(),
  width: z.number().min(3).max(12),
  index: z.number(),
});

export type Bay = z.infer<typeof baySchema>;

// Opening interface - Enhanced
export const openingSchema = z.object({
  id: z.string(),
  type: z.enum(openingTypes),
  wall: z.enum(wallPositions),
  position: z.object({ x: z.number(), y: z.number() }),
  dimensions: z.object({ width: z.number(), height: z.number() }),
  color: z.string(),
  swingDirection: z.enum(doorSwingDirections).optional(),
  hasFrame: z.boolean().optional(),
  frameColor: z.string().optional(),
  glazingType: z.string().optional(),
});

export type Opening = z.infer<typeof openingSchema>;

// Accessory interface
export const accessorySchema = z.object({
  id: z.string(),
  type: z.enum(accessoryTypes),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  color: z.string(),
  dimensions: z.object({ width: z.number(), length: z.number(), projection: z.number() }).optional(),
});

export type Accessory = z.infer<typeof accessorySchema>;

// Insulation configuration
export const insulationSchema = z.object({
  type: z.enum(insulationTypes),
  rValue: z.enum(insulationRValues).optional(),
  thickness: z.number().optional(),
  hasLiner: z.boolean().optional(),
  linerColor: z.string().optional(),
});

export type InsulationConfig = z.infer<typeof insulationSchema>;

// Panel configuration
export const panelConfigSchema = z.object({
  type: z.enum(panelTypes),
  profile: z.string().optional(),
  thickness: z.number().optional(),
  color: z.string(),
});

export type PanelConfig = z.infer<typeof panelConfigSchema>;

// Mezzanine configuration
export const mezzanineSchema = z.object({
  id: z.string(),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  dimensions: z.object({ width: z.number(), length: z.number() }),
  height: z.number(),
  loadCapacity: z.number(),
  hasRailing: z.boolean(),
  hasStairs: z.boolean(),
  stairsPosition: z.enum(wallPositions).optional(),
});

export type Mezzanine = z.infer<typeof mezzanineSchema>;

// Crane configuration - Full
export const craneConfigSchema = z.object({
  type: z.enum(craneTypes),
  capacity: z.number(),
  span: z.number().optional(),
  hookHeight: z.number().optional(),
  runwayLength: z.number().optional(),
  clearance: z.number().optional(),
  hasWalkway: z.boolean().optional(),
});

export type CraneConfig = z.infer<typeof craneConfigSchema>;

// Skylight configuration
export const skylightSchema = z.object({
  id: z.string(),
  type: z.enum(skylightTypes),
  position: z.object({ x: z.number(), y: z.number() }),
  dimensions: z.object({ width: z.number(), length: z.number() }),
  material: z.string().optional(),
});

export type Skylight = z.infer<typeof skylightSchema>;

// Ventilator configuration
export const ventilatorSchema = z.object({
  id: z.string(),
  type: z.enum(ventilationTypes),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  size: z.number().optional(),
  cfm: z.number().optional(),
});

export type Ventilator = z.infer<typeof ventilatorSchema>;

// Canopy configuration
export const canopySchema = z.object({
  id: z.string(),
  wall: z.enum(wallPositions),
  position: z.object({ x: z.number(), y: z.number() }),
  dimensions: z.object({ width: z.number(), projection: z.number() }),
  hasSupportColumns: z.boolean(),
  color: z.string(),
});

export type Canopy = z.infer<typeof canopySchema>;

// Lean-to attachment
export const leanToSchema = z.object({
  id: z.string(),
  attachedTo: z.enum(["left", "right"]),
  width: z.number().min(3).max(15),
  length: z.number().optional(),
  eaveHeight: z.number(),
  slope: z.string(),
  colors: z.object({
    wallPanels: z.string(),
    roofPanels: z.string(),
  }),
  openings: z.array(z.lazy(() => openingSchema)).optional(),
});

export type LeanTo = z.infer<typeof leanToSchema>;

// Building configuration - Enhanced
export const buildingConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  templateType: z.enum(templateTypes),
  dimensions: z.object({
    width: z.number().min(6).max(100),
    length: z.number().min(6).max(200),
    eaveHeight: z.number().min(3).max(15),
    baysPattern: z.string(),
  }),
  bays: z.array(baySchema).optional(),
  roof: z.object({
    type: z.enum(roofTypes),
    orientation: z.enum(roofOrientations).optional(),
    slope: z.string(),
  }),
  frameType: z.string(),
  endWallType: z.string().optional(),
  colors: z.object({
    wallPanels: z.string(),
    roofPanels: z.string(),
    primaryStructure: z.string(),
    secondaryStructure: z.string(),
    basePlate: z.string(),
    flashing: z.string(),
    accessories: z.string(),
  }),
  wallPanelConfig: panelConfigSchema.optional(),
  roofPanelConfig: panelConfigSchema.optional(),
  wallInsulation: insulationSchema.optional(),
  roofInsulation: insulationSchema.optional(),
  openings: z.array(openingSchema),
  accessories: z.array(accessorySchema),
  skylights: z.array(skylightSchema).optional(),
  ventilators: z.array(ventilatorSchema).optional(),
  canopies: z.array(canopySchema).optional(),
  mezzanines: z.array(mezzanineSchema).optional(),
  leanTos: z.array(leanToSchema).optional(),
  crane: craneConfigSchema.optional(),
});

export type BuildingConfig = z.infer<typeof buildingConfigSchema>;

// Project - Multiple buildings container
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  buildings: z.array(buildingConfigSchema),
  selectedBuildingId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Project = z.infer<typeof projectSchema>;

// Inquiry data
export const inquirySchema = z.object({
  buildingConfig: buildingConfigSchema,
  buildingSector: z.string(),
  buildingApplication: z.string(),
  realizationYear: z.number(),
  referralSource: z.string(),
  contactInfo: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    company: z.string(),
  }).optional(),
});

export type InquiryData = z.infer<typeof inquirySchema>;

// Insert schemas for API
export const insertInquirySchema = inquirySchema;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

// Visualization settings
export interface VisualizationSettings {
  showEdges: boolean;
  showFaces: boolean;
  showPanels: boolean;
  showSolidWalls: boolean;
  showOpenings: boolean;
  showFrames: boolean;
  showPurlins: boolean;
  showGirts: boolean;
  showFlashing: boolean;
  showAccessories: boolean;
  showBasePlate: boolean;
  showDimensions: boolean;
  showButtons: boolean;
}

// View modes
export const viewModes = ["3D", "+Y", "-Y", "+X", "-X", "-Z"] as const;
export type ViewMode = typeof viewModes[number];

// Safe UUID generator that works in all environments
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Create default bays from pattern
export function createBaysFromPattern(pattern: string): Bay[] {
  const parts = pattern.split('*');
  const count = parseInt(parts[0]) || 4;
  const width = parseFloat(parts[1]) || 6;
  return Array.from({ length: count }, (_, i) => ({
    id: generateId(),
    width,
    index: i,
  }));
}

// Default building configuration factory
export function createDefaultBuildingConfig(templateType: TemplateType, name?: string): BuildingConfig {
  const template = buildingTemplates.find(t => t.type === templateType)!;
  const baysPattern = "4*6";
  return {
    id: generateId(),
    name: name || template.name,
    templateType,
    dimensions: {
      width: template.defaultWidth,
      length: 24,
      eaveHeight: 6,
      baysPattern,
    },
    bays: createBaysFromPattern(baysPattern),
    roof: {
      type: template.defaultRoofType as RoofType,
      orientation: templateType === "single_slope" ? "right" : undefined,
      slope: "1/10",
    },
    frameType: "RF",
    endWallType: "bearing_frame",
    colors: {
      wallPanels: "Arctic White",
      roofPanels: "RAL 9006",
      primaryStructure: "RAL 3011",
      secondaryStructure: "RAL 9007",
      basePlate: "RAL 7035",
      flashing: "Arctic White",
      accessories: "RAL 9010",
    },
    wallPanelConfig: {
      type: "single_skin",
      profile: "Kirby Wall",
      color: "Arctic White",
    },
    roofPanelConfig: {
      type: "single_skin",
      profile: "Kirby Rib",
      color: "RAL 9006",
    },
    wallInsulation: {
      type: "none",
    },
    roofInsulation: {
      type: "none",
    },
    openings: [],
    accessories: [],
    skylights: [],
    ventilators: [],
    canopies: [],
    mezzanines: [],
    leanTos: [],
  };
}

// Create default project
export function createDefaultProject(name: string = "New Project"): Project {
  return {
    id: generateId(),
    name,
    buildings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Create default lean-to
export function createDefaultLeanTo(attachedTo: "left" | "right"): LeanTo {
  return {
    id: generateId(),
    attachedTo,
    width: 6,
    eaveHeight: 4,
    slope: "1/10",
    colors: {
      wallPanels: "Arctic White",
      roofPanels: "RAL 9006",
    },
    openings: [],
  };
}

// Create default mezzanine
export function createDefaultMezzanine(): Mezzanine {
  return {
    id: generateId(),
    position: { x: 2, y: 0, z: 2 },
    dimensions: { width: 8, length: 12 },
    height: 3,
    loadCapacity: 500,
    hasRailing: true,
    hasStairs: true,
    stairsPosition: "front",
  };
}

// Create default canopy
export function createDefaultCanopy(wall: WallPosition): Canopy {
  return {
    id: generateId(),
    wall,
    position: { x: 0, y: 0 },
    dimensions: { width: 6, projection: 3 },
    hasSupportColumns: true,
    color: "RAL 9006",
  };
}

// Create default skylight
export function createDefaultSkylight(): Skylight {
  return {
    id: generateId(),
    type: "single",
    position: { x: 6, y: 6 },
    dimensions: { width: 1.2, length: 2.4 },
    material: "polycarbonate",
  };
}

// Create default ventilator
export function createDefaultVentilator(type: VentilationType): Ventilator {
  return {
    id: generateId(),
    type,
    position: { x: 0, y: 0, z: 0 },
    size: type === "turbine_vent" ? 24 : 36,
    cfm: 1000,
  };
}

// User table (keeping existing)
import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
