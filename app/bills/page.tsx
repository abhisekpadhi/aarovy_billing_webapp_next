"use client";
import { Button } from "@/components/ui/button";
import { AppCtx } from "@/lib/models";

import { Label } from "@/components/ui/label";
import { BillType } from "@/lib/models";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaCog } from "react-icons/fa";
import { FaCalendar, FaPlus } from "react-icons/fa6";

import {
  MonthSelect,
  YearSelect,
} from "@/components/custom/MonthAndYearSelect";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { APICalls } from "@/lib/api";

export default function BillsPage() {
  const appCtx = useContext(AppCtx);
  const router = useRouter();

  if (!appCtx) {
    throw new Error("AppCtx not found");
  }

  const [isLoading, setIsLoading] = useState(true);

  const [showBillsDialog, setShowBillsDialog] = useState(false);

  const [bills, setBills] = useState<BillType[]>([]);
  const [year, setYear] = useState(0);
  const [month, setMonth] = useState(0);

  const fetchBillsByMonth = async (year: number, month: number) => {
    APICalls.fetchBillsByMonth(
      year,
      month,
      () => {
        setIsLoading(true);
      },
      (data) => {
        setBills(data);
      },
      (error) => {
        console.error(error);
        toast.error("Error fetching bills");
      },
      () => {
        setIsLoading(false);
      }
    );
  };

  const fetchThisMonthBills = async () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    await fetchBillsByMonth(currentYear, currentMonth);
  };

  useEffect(() => {
    fetchThisMonthBills();
  }, []);

  const handleShowBillsDialog = async () => {
    setShowBillsDialog(false);
    await fetchBillsByMonth(year, month);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const header = () => {
    return (
      <div className="flex items-center mb-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold mx-4">AAROVY</h1>
        </div>
        <div className="flex items-center">
          <Button
            variant={"default"}
            onClick={() => router.push("/bills/new")}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center mr-4"
          >
            <FaPlus />
          </Button>
          <Button
            variant={"default"}
            onClick={() => router.push("/settings")}
            className="rounded-full w-10 h-10 p-0 flex items-center justify-center ml-2"
          >
            <FaCog />
          </Button>
        </div>
      </div>
    );
  };

  const billsTable = () => {
    if (bills.length === 0) {
      return <div>No bills found</div>;
    }
    return (
      <div className="flex flex-col h-screen">
        <table>
          <thead className="border-b">
            <tr>
              <th>Flat</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr
                key={`${bill.year}_${bill.month}_${bill.flat}`}
                className="border-b hover:bg-gray-50"
              >
                <td className="text-center py-4 px-6">{bill.flat}</td>
                <td className="text-center py-4 px-6">{bill.grandTotal}</td>
                <td className="text-center py-4 px-6">
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        `/bills/${bill.year}_${bill.month}_${bill.flat}`
                      )
                    }
                    className="rounded-full"
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Dialog open={showBillsDialog} onOpenChange={setShowBillsDialog}>
      <div className="flex flex-col h-screen">
        {header()}
        <div className="mt-4" />
        <div className="flex justify-between">
          <div>
            <div className="text-xl font-semibold mx-4 mb-2">
              {month === 0 && year === 0
                ? "This month bills"
                : `${month}/${year} bills`}
            </div>
            <div className="text-m text-gray-500 mx-4 mb-4">
              Click on view button to see details
            </div>
          </div>

          <div className="flex">
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="rounded-full w-10 h-10 p-0 flex items-center justify-center mx-4"
                onClick={() => setShowBillsDialog(true)}
              >
                <FaCalendar />
              </Button>
            </DialogTrigger>
          </div>
        </div>
        {billsTable()}
      </div>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="text-left">
          <DialogTitle>Select Date</DialogTitle>
          <DialogDescription>
            Select the date to view bills for
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right col-span-1">
              Year
            </Label>
            <div className="col-span-3">
              <YearSelect
                value={year === 0 ? undefined : year.toString()}
                onChange={(value) => setYear(parseInt(value))}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="month" className="text-right col-span-1">
              Month
            </Label>
            <div className="col-span-3">
              <MonthSelect
                value={month === 0 ? undefined : month.toString()}
                onChange={(value) => setMonth(parseInt(value))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <div className="flex flex-col w-full gap-4">
            <Button type="submit" onClick={handleShowBillsDialog}>
              Show bills
            </Button>
            <Button
              type="submit"
              variant={"outline"}
              onClick={() => {
                setYear(0);
                setMonth(0);
                setShowBillsDialog(false);
                fetchThisMonthBills();
              }}
            >
              Reset to this month
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
