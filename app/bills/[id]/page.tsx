"use client";
import { AppCtx } from "@/app/layout";
import { Button } from "@/components/ui/button";
import { BillType } from "@/lib/models";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa6";

export default function ViewBillPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const appCtx = useContext(AppCtx);
  const router = useRouter();

  if (!appCtx) {
    throw new Error("AppCtx not found");
  }

  const { bills } = appCtx;
  const [bill, setBill] = useState<BillType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBillFromDB = async (id: string) => {
    console.debug("Fetching bill from DB", id);
    const response = await fetch(`/api/bills/${id}`);
    const data = await response.json();
    if (data.success) {
      setBill(data.data);
    }
  };

  useEffect(() => {
    (async () => {
      const id = (await params).id;
      console.debug("id", id);
      if (!id) {
        console.debug("No id found");
        setIsLoading(false);
        toast.error("No id found");
        return;
      }
      const [year, month, flat] = id.split("_");
      console.debug("year", year, "month", month, "flat", flat);
      const bill = bills.find(
        (bill) =>
          bill.year === year && bill.month === month && bill.flat === flat
      );
      console.debug("bill from context", bill);
      if (bill) {
        setBill(bill);
      }
      if (!bill) {
        await fetchBillFromDB(id);
      }
      setIsLoading(false);
    })();
  }, [bills, params]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bill) {
    return <div>Bill not found</div>;
  }

  const header = () => {
    return (
      <div className="flex items-center my-4">
        <Button
          variant={"default"}
          onClick={() => router.back()}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold mx-4">Bill</h1>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {header()}
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
