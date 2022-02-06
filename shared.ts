export type TemplatesMap = { [key: string]: string };
export type ReplaceOptions = { [key: string]: string };

export function _replace(
  TEMPLATES: { [key: string]: string },
  file: string,
  replace?: ReplaceOptions,
): string {
  if (replace) {
    const nameRE = /___name___/g
    return TEMPLATES[file].replace(nameRE, replace["name"])
  }
  return TEMPLATES[file]
}
