"use strict";
  const DRAG_RADIANS_PER_PIXEL = .008;
  const MAX_ELEVATION = 1.3;

  function dragOrbit(azimuth, elevation, dx, dy) {
    return {
      azimuth: azimuth - dx * DRAG_RADIANS_PER_PIXEL,
      elevation: Math.max(
        -MAX_ELEVATION,
        Math.min(MAX_ELEVATION, elevation + dy * DRAG_RADIANS_PER_PIXEL),
      ),
    };
  }

  function coordinates(point, azimuth, elevation) {
    const cosineAzimuth = Math.cos(azimuth);
    const sineAzimuth = Math.sin(azimuth);
    const cosineElevation = Math.cos(elevation);
    const sineElevation = Math.sin(elevation);
    return {
      horizontal: -sineAzimuth * point.x + cosineAzimuth * point.y,
      vertical: -sineElevation * cosineAzimuth * point.x
        - sineElevation * sineAzimuth * point.y
        + cosineElevation * point.z,
      depth: cosineElevation * cosineAzimuth * point.x
        + cosineElevation * sineAzimuth * point.y
        + sineElevation * point.z,
    };
  }

  export {coordinates, dragOrbit};
