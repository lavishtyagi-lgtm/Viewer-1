import * as THREE from "three";

export function getWholeModelBoundingBox(viewer: any) {
  const fragList = viewer.model.getFragmentList();
  const box = new THREE.Box3();
  const fragBox = new THREE.Box3();

  for (let i = 0; i < fragList.getCount(); i++) {
    fragList.getWorldBounds(i, fragBox);
    box.union(fragBox);
  }

  return box;
}