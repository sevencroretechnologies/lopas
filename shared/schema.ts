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

// Opening types
export const openingTypes = ["window", "door", "sliding_door", "roll_door", "sectional_door"] as const;
export type OpeningType = typeof openingTypes[number];

// Wall positions
export const wallPositions = ["front", "back", "left", "right", "roof"] as const;
export type WallPosition = typeof wallPositions[number];

// Accessory types
export const accessoryTypes = ["vent", "canopy", "reflector", "gutter", "downspout"] as const;
export type AccessoryType = typeof accessoryTypes[number];

// Building sectors
export const buildingSectors = [
  "Industrial", "Commercial", "Agricultural", "Recreational", "Aviation", "Warehouse", "Other"
] as const;

// Building applications
export const buildingApplications = [
  "Plants/Factories", "Warehouses", "Distribution Centers", "Manufacturing", 
  "Cold Storage", "Aircraft Hangars", "Sports Facilities", "Retail", "Other"
] as const;

// Opening interface
export const openingSchema = z.object({
  id: z.string(),
  type: z.enum(openingTypes),
  wall: z.enum(wallPositions),
  position: z.object({ x: z.number(), y: z.number() }),
  dimensions: z.object({ width: z.number(), height: z.number() }),
  color: z.string(),
});

export type Opening = z.infer<typeof openingSchema>;

// Accessory interface
export const accessorySchema = z.object({
  id: z.string(),
  type: z.enum(accessoryTypes),
  position: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  color: z.string(),
});

export type Accessory = z.infer<typeof accessorySchema>;

// Building configuration
export const buildingConfigSchema = z.object({
  id: z.string(),
  templateType: z.enum(templateTypes),
  dimensions: z.object({
    width: z.number().min(6).max(100),
    length: z.number().min(6).max(200),
    eaveHeight: z.number().min(3).max(15),
    baysPattern: z.string(),
  }),
  roof: z.object({
    type: z.enum(roofTypes),
    orientation: z.enum(roofOrientations).optional(),
    slope: z.string(),
  }),
  frameType: z.string(),
  colors: z.object({
    wallPanels: z.string(),
    roofPanels: z.string(),
    primaryStructure: z.string(),
    secondaryStructure: z.string(),
    basePlate: z.string(),
    flashing: z.string(),
    accessories: z.string(),
  }),
  openings: z.array(openingSchema),
  accessories: z.array(accessorySchema),
  crane: z.object({
    capacity: z.number(),
  }).optional(),
});

export type BuildingConfig = z.infer<typeof buildingConfigSchema>;

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

// Default building configuration factory
export function createDefaultBuildingConfig(templateType: TemplateType): BuildingConfig {
  const template = buildingTemplates.find(t => t.type === templateType)!;
  return {
    id: generateId(),
    templateType,
    dimensions: {
      width: template.defaultWidth,
      length: 24,
      eaveHeight: 6,
      baysPattern: "4*6",
    },
    roof: {
      type: template.defaultRoofType as RoofType,
      orientation: templateType === "single_slope" ? "right" : undefined,
      slope: "1/10",
    },
    frameType: "RF",
    colors: {
      wallPanels: "Arctic White",
      roofPanels: "RAL 9006",
      primaryStructure: "RAL 3011",
      secondaryStructure: "RAL 9007",
      basePlate: "RAL 7035",
      flashing: "Arctic White",
      accessories: "RAL 9010",
    },
    openings: [],
    accessories: [],
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
