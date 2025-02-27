"use client";
import { AppCtx } from "@/app/layout";
import { BillType } from "@/lib/models";
import { useContext, useEffect, useState } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const appCtx = useContext(AppCtx);

  if (!appCtx) {
    throw new Error("AppCtx not found");
  }

  const { bills } = appCtx;
  const [bill, setBill] = useState<BillType | null>(null);

  useEffect(() => {
    console.log("params", params);
    (async () => {
      const id = (await params).id;
      console.log("id", id);
      const [year, month, flat] = id.split("_");
      console.log("year", year, "month", month, "flat", flat);
      const bill = bills.find(
        (bill) =>
          bill.year === year && bill.month === month && bill.flat === flat
      );
      console.log("bill", bill);
      if (bill) {
        setBill(bill);
      }

    })();
  }, [bills, params]);

  return (
    <div>
      {bill && (
        <div>
          <p>Flat: {bill.flat}</p>
          <p>Month: {bill.month}</p>
          <p>Year: {bill.year}</p>
          <p>Opening Unit: {bill.openingUnit}</p>
          <p>Closing Unit: {bill.closingUnit}</p>
          <p>Used Unit: {bill.usedUnit}</p>
          <p>Common Tenants: {bill.commonTenants}</p>
          <p>Common Opening Unit: {bill.commonOpenUnit}</p>
          <p>Common Closing Unit: {bill.commonCloseUnit}</p>
          <p>Common Used Unit: {bill.commonUsedUnit}</p>
          <p>Chargeable Unit: {bill.chargeableUnit}</p>
          <p>Main Meter Billed: {bill.mainMeterBilled}</p>
          <p>Main Meter Consumed Unit: {bill.mainMeterConsumedUnit}</p>
          <p>Rate Per Unit: {bill.ratePerUnit}</p>
          <p>Sub Total: {bill.subTotal}</p>
          <p>Other Misc Charges: {bill.otherMiscCharges}</p>
          <p>Society Maintenance Charges: {bill.societyMaintenanceCharges}</p>
          <p>Parking Charges: {bill.parkingCharges}</p>
          <p>House Rent: {bill.houseRent}</p>
          <p>Arrears: {bill.arrears}</p>
          <p>Adjustment: {bill.adjustment}</p>
          <p>Grand Total: {bill.grandTotal}</p>
        </div>
      )}
    </div>
  );
}
