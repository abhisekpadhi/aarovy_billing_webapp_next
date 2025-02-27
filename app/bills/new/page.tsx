"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";

import { AppCtx } from "@/app/layout";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BillType } from "@/lib/models";
import { toast } from "react-hot-toast";

export function FlatSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={props.value} onValueChange={props.onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a flat" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Flats</SelectLabel>
          <SelectItem value="G">G</SelectItem>
          <SelectItem value="1">1</SelectItem>
          <SelectItem value="2">2</SelectItem>
          <SelectItem value="3">3</SelectItem>
          <SelectItem value="4">4</SelectItem>
          <SelectItem value="5">5</SelectItem>
          <SelectItem value="6">6</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function MonthSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select value={props.value} onValueChange={props.onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a month" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Months</SelectLabel>
          <SelectItem value="1">January</SelectItem>
          <SelectItem value="2">February</SelectItem>
          <SelectItem value="3">March</SelectItem>
          <SelectItem value="4">April</SelectItem>
          <SelectItem value="5">May</SelectItem>
          <SelectItem value="6">June</SelectItem>
          <SelectItem value="7">July</SelectItem>
          <SelectItem value="8">August</SelectItem>
          <SelectItem value="9">September</SelectItem>
          <SelectItem value="10">October</SelectItem>
          <SelectItem value="11">November</SelectItem>
          <SelectItem value="12">December</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function YearSelect(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <Select value={props.value} onValueChange={props.onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a year" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Years</SelectLabel>
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export default function NewBill() {
  const [formData, setFormData] = useState({
    month: "1",
    year: "2025",
    flat: "G",
    openingUnit: "15605",
    closingUnit: "15762",
    usedUnit: "157",
    commonTenants: "7",
    commonOpenUnit: "8727",
    commonCloseUnit: "8866",
    commonUsedUnit: "19.86",
    chargeableUnit: "176.86",
    mainMeterBilled: "9883",
    mainMeterConsumedUnit: "1596",
    ratePerUnit: "6.19",
    subTotal: "1094.76",
    otherMiscCharges: "0.0",
    societyMaintenanceCharges: "0.0",
    parkingCharges: "0.0",
    houseRent: "11500.0",
    arrears: "0.0",
    adjustment: "0.0",
    grandTotal: "12594.76",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Calculate used unit
  useEffect(() => {
    const opening = parseFloat(formData.openingUnit) || 0;
    const closing = parseFloat(formData.closingUnit) || 0;
    const used = (closing - opening).toString();
    setFormData((prev) => ({ ...prev, usedUnit: used }));
  }, [formData.openingUnit, formData.closingUnit]);

  // Calculate common used unit
  useEffect(() => {
    const commonOpen = parseFloat(formData.commonOpenUnit) || 0;
    const commonClose = parseFloat(formData.commonCloseUnit) || 0;
    const tenants = parseFloat(formData.commonTenants) || 0;

    if (tenants > 0 && commonOpen !== 0 && commonClose !== 0) {
      const commonUsed = ((commonClose - commonOpen) / tenants)
        .toFixed(2)
        .toString();
      setFormData((prev) => ({ ...prev, commonUsedUnit: commonUsed }));
    }
  }, [
    formData.commonOpenUnit,
    formData.commonCloseUnit,
    formData.commonTenants,
  ]);

  // Calculate chargeable unit
  useEffect(() => {
    const used = parseFloat(formData.usedUnit) || 0;
    const commonUsed = parseFloat(formData.commonUsedUnit) || 0;
    const chargeable = (used + commonUsed).toFixed(2).toString();
    setFormData((prev) => ({ ...prev, chargeableUnit: chargeable }));
  }, [formData.usedUnit, formData.commonUsedUnit]);

  // Calculate rate per unit
  useEffect(() => {
    const mainBilled = parseFloat(formData.mainMeterBilled) || 0;
    const mainConsumed = parseFloat(formData.mainMeterConsumedUnit) || 0;

    if (mainConsumed > 0) {
      const rate = (mainBilled / mainConsumed).toFixed(2).toString();
      setFormData((prev) => ({ ...prev, ratePerUnit: rate }));
    }
  }, [formData.mainMeterBilled, formData.mainMeterConsumedUnit]);

  // Calculate subtotal
  useEffect(() => {
    const chargeableUnit = parseFloat(formData.chargeableUnit) || 0;
    const ratePerUnit = parseFloat(formData.ratePerUnit) || 0;
    const subtotal = (chargeableUnit * ratePerUnit).toFixed(2).toString();
    setFormData((prev) => ({ ...prev, subTotal: subtotal }));
  }, [formData.chargeableUnit, formData.ratePerUnit]);

  // Calculate grand total
  useEffect(() => {
    const subtotal = parseFloat(formData.subTotal) || 0;
    const miscCharges = parseFloat(formData.otherMiscCharges) || 0;
    const maintenanceCharges =
      parseFloat(formData.societyMaintenanceCharges) || 0;
    const parkingCharges = parseFloat(formData.parkingCharges) || 0;
    const houseRent = parseFloat(formData.houseRent) || 0;
    const arrears = parseFloat(formData.arrears) || 0;
    const adjustment = parseFloat(formData.adjustment) || 0;

    const grandTotal = (
      subtotal +
      miscCharges +
      maintenanceCharges +
      parkingCharges +
      houseRent +
      arrears +
      adjustment
    )
      .toFixed(2)
      .toString();

    setFormData((prev) => ({ ...prev, grandTotal: grandTotal }));
  }, [
    formData.subTotal,
    formData.otherMiscCharges,
    formData.societyMaintenanceCharges,
    formData.parkingCharges,
    formData.houseRent,
    formData.arrears,
    formData.adjustment,
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const appCtx = useContext(AppCtx);

  const saveBill = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/bills", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      const id = `${formData.year}_${formData.month}_${formData.flat}`;
      if (data.success) {
        if (appCtx) {
          const updatedBills = [...appCtx.bills, formData as BillType];
          appCtx.setBills(updatedBills);
        }
      }
      router.push(`/bills/${id}`);
    } catch (error) {
      console.error("Error saving bill:", error);
      toast.error("Could not save bill");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log(formData);

    // Flat, Month, Year are required fields
    const missingFields = [];
    if (!formData.flat) missingFields.push("flat");
    if (!formData.month) missingFields.push("month");
    if (!formData.year) missingFields.push("year");

    if (missingFields.length > 0) {
      toast(`Please select ${missingFields.join(", ")}`, {
        icon: "⚠️",
        style: {
          borderRadius: "10px",
          background: "#000",
          color: "#fff",
        },
      });
      return;
    }

    toast.promise(
      saveBill(),
      {
        loading: "Saving...",
        success: "Bill saved successfully",
        error: "Could not save bill",
      },
      {
        style: {
          borderRadius: "10px",
          background: "#000",
          color: "#fff",
        },
      }
    );
  };

  const router = useRouter();

  const header = () => {
    return (
      <div className="flex items-center my-4">
        <Button variant={"default"} onClick={() => router.back()}>
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold mx-4">New Bill</h1>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {header()}
      <form onSubmit={handleSubmit} className="flex-grow pb-20">
        <div className="my-4 mx-1">
          <label>Flat</label>
          <FlatSelect
            value={formData.flat}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, flat: value }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="mx-1">
            <label>Month</label>
            <MonthSelect
              value={formData.month}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, month: value }))
              }
            />
          </div>
          <div className="mx-1">
            <label>Year</label>
            <YearSelect
              value={formData.year}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, year: value }))
              }
            />
          </div>
        </div>
        <div className="my-4 mx-1">
          <label>Opening Unit</label>
          <Input
            name="openingUnit"
            value={formData.openingUnit}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Closing Unit</label>
          <Input
            name="closingUnit"
            value={formData.closingUnit}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Used Unit</label>
          <div>{formData.usedUnit}</div>
        </div>

        <div className="my-4 mx-1">
          <label>Common Tenants</label>
          <Input
            name="commonTenants"
            value={formData.commonTenants}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Common Open Unit</label>
          <Input
            name="commonOpenUnit"
            value={formData.commonOpenUnit}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Common Close Unit</label>
          <Input
            name="commonCloseUnit"
            value={formData.commonCloseUnit}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Common Used Unit</label>
          <div>{formData.commonUsedUnit}</div>
        </div>
        <div className="my-4 mx-1">
          <label>Chargeable Unit</label>
          <div>{formData.chargeableUnit}</div>
        </div>
        <div className="my-4 mx-1">
          <label>Main Meter Billed</label>
          <Input
            name="mainMeterBilled"
            value={formData.mainMeterBilled}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Main Meter Consumed Unit</label>
          <Input
            name="mainMeterConsumedUnit"
            value={formData.mainMeterConsumedUnit}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Rate Per Unit</label>
          <div>{formData.ratePerUnit}</div>
        </div>
        <div className="my-4 mx-1">
          <label>Sub Total</label>
          <div>{formData.subTotal}</div>
        </div>
        <div className="my-4 mx-1">
          <label>House Rent</label>
          <Input
            name="houseRent"
            value={formData.houseRent}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Other Misc Charges</label>
          <Input
            name="otherMiscCharges"
            value={formData.otherMiscCharges}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Society Maintenance Charges</label>
          <Input
            name="societyMaintenanceCharges"
            value={formData.societyMaintenanceCharges}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Parking Charges</label>
          <Input
            name="parkingCharges"
            value={formData.parkingCharges}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Arrears</label>
          <Input
            name="arrears"
            value={formData.arrears}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Adjustment</label>
          <Input
            name="adjustment"
            value={formData.adjustment}
            onChange={handleChange}
            required
            type="number"
            inputMode="numeric"
            pattern="-?[0-9]*"
          />
        </div>
        <div className="my-4 mx-1">
          <label>Grand Total</label>
          <div>{formData.grandTotal}</div>
        </div>
        <Button
          disabled={isLoading}
          type="submit"
          variant={"default"}
          className="w-full"
        >
          {isLoading ? "Creating..." : "Create Bill"}
        </Button>
      </form>
    </div>
  );
}
