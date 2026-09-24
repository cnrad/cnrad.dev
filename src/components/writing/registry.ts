import type { ComponentType } from "react";
import { CrossEyeDemo } from "./CrossEyeDemo";
import { StereoModal } from "./StereoModal";
import { WiggleStereo } from "./WiggleStereo";
import { DragReorder } from "./DragReorder";
import { DropdownMenu } from "./DropdownMenu";
import { Newsstand } from "./Newsstand";
import { Modal3D } from "./Modal3D";
import { RecencyDesktop } from "./RecencyDesktop";
import { WebglStereoscopy } from "./WebglStereoscopy";

// Components that posts can embed via a `:::component <Name>` directive in their
// markdown. The key is the name you type in the .md; the value is the component.
// Add new post components here and reference them by their key.
//
// Props are passed as an optional JSON object inside the directive body:
//
//   :::component StereoModal
//   { "variant": "flicker" }
//   :::
//
// Components receive that object as their props, so type each component's props
// to match what you pass.
export const WRITING_COMPONENTS: Record<string, ComponentType<any>> = {
  CrossEyeDemo,
  StereoModal,
  WiggleStereo,
  DragReorder,
  DropdownMenu,
  Newsstand,
  Modal3D,
  RecencyDesktop,
  WebglStereoscopy,
};
