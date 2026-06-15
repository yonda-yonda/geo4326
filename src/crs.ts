import { InvalidCodeError } from "./errors";
import { epsgIndex } from "./_generated/epsg-index";

export function getCrs(code: string | number): string {
  const epsgNumber =
    typeof code === "string" && !!/^epsg:/i.exec(code)
      ? Number(code.replace(/^epsg:/i, ""))
      : code;
  if (typeof epsgNumber === "string") return epsgNumber;

  const epsgDef = (epsgIndex as Record<string, string | null | undefined>)[
    epsgNumber
  ];
  if (typeof epsgDef === "string") {
    return epsgDef;
  } else {
    throw new InvalidCodeError();
  }
}
