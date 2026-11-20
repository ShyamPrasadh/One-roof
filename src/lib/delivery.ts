import type { Settings } from "./types";
import { round2 } from "./billing";

/** Great-circle distance in km between two points. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return round2(2 * R * Math.asin(Math.sqrt(h)));
}

export type DeliveryQuote = { distanceKm: number | null; fee: number };

/**
 * Distance-based delivery fee: base fee + per-km rate.
 * Without the customer's location the base fee applies and distance is unknown (null).
 */
export function deliveryQuote(settings: Settings, lat?: number, lng?: number): DeliveryQuote {
  if (lat === undefined || lng === undefined || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { distanceKm: null, fee: settings.deliveryBaseFee };
  }
  const km = distanceKm(settings.lat, settings.lng, lat, lng);
  if (km > settings.deliveryMaxKm) {
    throw new Error(`Sorry, we deliver only within ${settings.deliveryMaxKm} km of the store.`);
  }
  return { distanceKm: km, fee: Math.ceil(settings.deliveryBaseFee + settings.deliveryPerKm * km) };
}
