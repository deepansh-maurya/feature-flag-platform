import { Rule } from "../../types";

export function rid() { return Math.random().toString(36).slice(2, 10); }
export function renumber(list: Rule[]) { return list.map((r, i) => ({ ...r, priority: i + 1 })); }
export function humanize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }
export function parseTokens(s: string): string[] {
  const txt = s.toLowerCase();
  const tokens: string[] = [];
  if (/india|\bin\s*india\b|\bregion\s*=\s*in/.test(txt)) tokens.push("region=IN");
  if (/us|\bin\s*us\b|\bregion\s*=\s*us/.test(txt)) tokens.push("region=US");
  if (/pro/.test(txt)) tokens.push("plan=pro");
  if (/free/.test(txt)) tokens.push("plan=free");
  if (/ios/.test(txt)) tokens.push("platform=iOS");
  if (/android/.test(txt)) tokens.push("platform=Android");
  if (tokens.length === 0) tokens.push("*");
  return tokens;
}
