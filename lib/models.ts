import { createContext } from "react";

export const AppCtx = createContext<AppCtxType | null>(null);
export type AppCtxType = {
  billCached: BillType | null;
  setBillCached: (bill: BillType | null) => void;
};

export type BillType = {
  recordedOn: string;
  guestName: string;
  month: string;
  year: string;
  flat: string;
  openingUnit: string;
  closingUnit: string;
  usedUnit: string;
  commonTenants: string;
  commonOpenUnit: string;
  commonCloseUnit: string;
  commonUsedUnit: string;
  chargeableUnit: string;
  mainMeterBilled: string;
  mainMeterConsumedUnit: string;
  ratePerUnit: string;
  subTotal: string;
  otherMiscCharges: string;
  societyMaintenanceCharges: string;
  parkingCharges: string;
  houseRent: string;
  arrears: string;
  arrearsDescription: string;
  adjustment: string;
  adjustmentDescription: string;
  grandTotal: string;
};

export type FlatDetailsType = {
  [flat: string]: {
    rent: number;
    guest_name: string;
  };
};

export type CacheType<T> = {
  data: T;
  expiresAt: number;
  createdAt: number;
};
