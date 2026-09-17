import type { ComponentType } from "react";
import { StereoModal } from "./StereoModal";
import { PerspectiveDiagram } from "./PerspectiveDiagram";
import { DragReorder } from "./DragReorder";
import { DropdownMenu } from "./DropdownMenu";
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
  StereoModal,
  PerspectiveDiagram,
  DragReorder,
  DropdownMenu,
  WebglStereoscopy,
};
