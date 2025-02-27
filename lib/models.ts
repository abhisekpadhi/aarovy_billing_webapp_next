export type AppCtxType = {
  bills: BillType[];
  setBills: (bills: BillType[]) => void;
};

export type BillType = {
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
  adjustment: string;
  grandTotal: string;
};
