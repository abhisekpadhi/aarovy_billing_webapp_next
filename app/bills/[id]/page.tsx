"use client";
import PdfBill from "@/components/custom/PdfBill";
import { Button } from "@/components/ui/button";
import { AppCtx, BillType } from "@/lib/models";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaPencil } from "react-icons/fa6";

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

  const { billCached } = appCtx;
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
      const idFromParams = (await params).id;
      console.debug("id", idFromParams);
      if (!idFromParams) {
        console.debug("No id found");
        setIsLoading(false);
        toast.error("No id found");
        return;
      }
      const [year, month, flat] = idFromParams.split("_");
      console.debug("year", year, "month", month, "flat", flat);
      console.debug("bill from context", billCached);

      if (
        billCached?.year === year &&
        billCached?.month === month &&
        billCached?.flat === flat
      ) {
        setBill(billCached);
      }
      if (!bill) {
        await fetchBillFromDB(idFromParams);
      }
      setIsLoading(false);
    })();
  }, [bill, billCached, params]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!bill) {
    return <div>Bill not found</div>;
  }

  const header = () => {
    return (
      <div className="flex items-center mb-4 justify-between">
        <div className="flex items-center">
          <Button
            variant={"default"}
            onClick={() => router.back()}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <FaArrowLeft />
          </Button>
          <h1 className="text-2xl font-bold mx-4">Bill</h1>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            onClick={() => {
              // set bill in AppCtx and then redirect to edit page
              appCtx.setBillCached(bill);
              router.push(
                `/bills/${bill.year}_${bill.month}_${bill.flat}/edit`
              );
            }}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
          >
            <FaPencil />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen pb-4">
      {header()}
      <div className="text-center mb-4">
        <p>Flat/Meter No. {bill.flat} & C</p>
        <p>
          For the month of{" "}
          {new Date(0, parseInt(bill.month) - 1).toLocaleString("default", {
            month: "long",
          })}{" "}
          {bill.year}, Recorded on dt. {bill.recordedOn}
        </p>
        <p>Name of the Guest: {bill.guestName}</p>
      </div>
      {bill && (
        <table className="w-full border-collapse border">
          <thead>
            <tr>
              <th className="border p-2 text-center w-[5%]"></th>
              <th className="border p-2 text-center w-[60%]">Description</th>
              <th className="border p-2 text-center w-[35%]">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 text-center">A</td>
              <td className="border p-2">Opening Unit: {bill.openingUnit}</td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">B</td>
              <td className="border p-2">Closing Unit: {bill.closingUnit}</td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">C</td>
              <td className="border p-2">Used Unit: {bill.usedUnit}</td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">D</td>
              <td className="border p-2">
                Common Tenants: {bill.commonTenants}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">E</td>
              <td className="border p-2">
                Common Opening Unit: {bill.commonOpenUnit}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">F</td>
              <td className="border p-2">
                Common Closing Unit: {bill.commonCloseUnit}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">G</td>
              <td className="border p-2">
                Common Used Unit: {bill.commonUsedUnit}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">H</td>
              <td className="border p-2">
                Chargeable Unit: {bill.chargeableUnit}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">I</td>
              <td className="border p-2">
                Main Meter Billed: {bill.mainMeterBilled}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">J</td>
              <td className="border p-2">
                Main Meter Consumed Unit: {bill.mainMeterConsumedUnit}
              </td>
              <td className="border p-2 text-right"></td>
            </tr>
            <tr>
              <td className="border p-2 text-center">K</td>
              <td className="border p-2">Rate Per Unit</td>
              <td className="border p-2 text-right">
                {Number(bill.ratePerUnit).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">L</td>
              <td className="border p-2">Sub Total</td>
              <td className="border p-2 text-right">
                {Number(bill.subTotal).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">M</td>
              <td className="border p-2">Other Misc Charges</td>
              <td className="border p-2 text-right">
                {Number(bill.otherMiscCharges).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">N</td>
              <td className="border p-2">Society Maintenance Charges</td>
              <td className="border p-2 text-right">
                {Number(bill.societyMaintenanceCharges).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">O</td>
              <td className="border p-2">Parking Charges</td>
              <td className="border p-2 text-right">
                {Number(bill.parkingCharges).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">P</td>
              <td className="border p-2">House Rent</td>
              <td className="border p-2 text-right">
                {Number(bill.houseRent).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">Q</td>
              <td className="border p-2">
                Arrears
                <br />
                <span className="text-sm">{bill.arrearsDescription}</span>
              </td>

              <td className="border p-2 text-right">
                {Number(bill.arrears).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">R</td>
              <td className="border p-2">
                Adjustment
                <br />
                <span className="text-sm">{bill.adjustmentDescription}</span>
              </td>
              <td className="border p-2 text-right">
                {Number(bill.adjustment).toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border p-2 text-center">S</td>
              <td className="border p-2">Grand Total</td>
              <td className="border p-2 text-right font-bold">
                {Number(bill.grandTotal).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div className="mt-4 pb-4">
        <PdfBill bill={{ ...bill, flat: `${bill.flat} & C` }} />
      </div>
    </div>
  );
}
