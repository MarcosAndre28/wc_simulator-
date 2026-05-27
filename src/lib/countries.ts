import countries from "@/data/countries.json";
import { Country } from "@/types/tournament";

export const COUNTRIES: Country[] = countries;

export function getCountryByIso(iso: string): Country | undefined {
  return COUNTRIES.find((country) => country.iso === iso);
}

export function getFlagPath(iso: string): string {
  return `/flags/${iso}.svg`;
}

export function searchCountries(query: string): Country[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return COUNTRIES;
  }

  return COUNTRIES.filter(
    (country) =>
      country.name.toLowerCase().includes(normalized) ||
      country.code.toLowerCase().includes(normalized) ||
      country.iso.toLowerCase().includes(normalized),
  );
}
