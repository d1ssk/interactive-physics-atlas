"use strict";
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

  export {coordinates};
