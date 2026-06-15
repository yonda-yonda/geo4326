import { getCrs } from "./crs";
import { InvalidCodeError } from "./errors";

it("getCrs", () => {
  expect(getCrs(4326)).toBe("+proj=longlat +datum=WGS84 +no_defs +type=crs");
  expect(getCrs("EPSG:3031")).toBe(
    "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
  );
  expect(getCrs("epsg:3031")).toBe(
    "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs",
  );
  expect(getCrs("epsg3031")).toBe("epsg3031");

  expect(() => {
    getCrs("epsg:1");
  }).toThrow(InvalidCodeError);
});
