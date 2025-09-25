import React, { useEffect, useRef, CSSProperties } from "react";
import { getWholeModelBoundingBox } from "./BoundingBoxUtils";

declare const Autodesk: any;

const viewerStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  position: "relative",
  backgroundColor: "#f0f0f0",
};

const ForgeViewer: React.FC<any> = ({ urn, getAccessToken }) => {
  const viewerDiv = useRef<HTMLDivElement>(null);
  const viewerInstance = useRef<any>(null);

  useEffect(() => {
    if (!viewerDiv.current) return;

    Autodesk.Viewing.Initializer({ env: "AutodeskProduction", getAccessToken }, () => {
      const viewer = new Autodesk.Viewing.GuiViewer3D(viewerDiv.current!, {
        extensions: ["Autodesk.DocumentBrowser"],
      });
      viewer.start();
      viewer.setTheme("light-theme");
      viewerInstance.current = viewer;

      if (urn) {
        Autodesk.Viewing.Document.load(
          `urn:${urn}`,
          (doc: any) => {
            const defaultModel = doc.getRoot().getDefaultGeometry();
            viewer.loadDocumentNode(doc, defaultModel, {});

            // ✅ Load our custom extension
            viewer.loadExtension("BoundingBoxExtension");
          },
          (code: any, message: any) => {
            console.error("Failed to load document", message);
          }
        );
      }
    });

    return () => {
      if (viewerInstance.current && viewerInstance.current.finish) {
        viewerInstance.current.finish();
        viewerInstance.current = null;
      }
    };
  }, [urn, getAccessToken]);

  return <div ref={viewerDiv} style={viewerStyle} id="forgeViewer" />;
};

export default ForgeViewer;

// ✅ Register Custom Extension
class BoundingBoxExtension extends Autodesk.Viewing.Extension {
  constructor(viewer: any, options: any) {
    super(viewer, options);
  }

  load() {
    console.log("BoundingBoxExtension loaded");
    return true;
  }

  onToolbarCreated(toolbar: any) {
    const viewer = this.viewer;
    const button = new Autodesk.Viewing.UI.Button("show-bbox-btn");

    button.setToolTip("Show Model Bounding Box");
    button.setIcon("adsk-icon-measure"); // Autodesk built-in icon

    button.onClick = () => {
      const bbox = getWholeModelBoundingBox(viewer);
      if (bbox) {
        drawBoundingBox(viewer, bbox);
      }
    };

    const subToolbar = new Autodesk.Viewing.UI.ControlGroup("custom-bbox-toolbar");
    subToolbar.addControl(button);
    toolbar.addControl(subToolbar);
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension("BoundingBoxExtension", BoundingBoxExtension);

// ✅ Utility to draw box edges
function drawBoundingBox(viewer: any, bbox: any) {
  const THREE = (window as any).THREE;
  if (!THREE) return;

  if (!viewer.overlays.hasScene("bboxOverlay")) {
    viewer.overlays.addScene("bboxOverlay");
  }
  viewer.overlays.clearScene("bboxOverlay");

  const min = bbox.min;
  const max = bbox.max;

  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    // bottom square
    min.x, min.y, min.z,  max.x, min.y, min.z,
    max.x, min.y, min.z,  max.x, max.y, min.z,
    max.x, max.y, min.z,  min.x, max.y, min.z,
    min.x, max.y, min.z,  min.x, min.y, min.z,

    // top square
    min.x, min.y, max.z,  max.x, min.y, max.z,
    max.x, min.y, max.z,  max.x, max.y, max.z,
    max.x, max.y, max.z,  min.x, max.y, max.z,
    min.x, max.y, max.z,  min.x, min.y, max.z,

    // vertical edges
    min.x, min.y, min.z,  min.x, min.y, max.z,
    max.x, min.y, min.z,  max.x, min.y, max.z,
    max.x, max.y, min.z,  max.x, max.y, max.z,
    min.x, max.y, min.z,  min.x, max.y, max.z,
  ]);
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));

  const material = new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 });
  const lines = new THREE.LineSegments(geometry, material);

  viewer.overlays.addMesh(lines, "bboxOverlay");
  viewer.impl.invalidate(true, true, true); // ✅ force redraw
}