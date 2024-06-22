import Papa, { type UnparseConfig } from "papaparse";

export function parse<T>(file: string): Papa.ParseResult<T> {
  return Papa.parse<T>(file, { header: true });
}
export function format(data: unknown[], config: UnparseConfig): string {
  return Papa.unparse(data, config);
}
