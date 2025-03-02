"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FlatDetailsType } from "@/lib/models";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

export default function SettingsPage() {
  const router = useRouter();
  const [flatDetails, setFlatDetails] = useState<FlatDetailsType>({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const flatDetails = await axios.get("/api/flats");
        setFlatDetails(flatDetails.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Could not fetch flat details");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const header = () => {
    return (
      <div className="flex items-center mb-4">
        <Button
          variant={"default"}
          onClick={() => router.back()}
          className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
        >
          <FaArrowLeft />
        </Button>
        <h1 className="text-2xl font-bold mx-4">Settings</h1>
      </div>
    );
  };

  const updateFlatDetails = async () => {
    try {
      setIsLoading(true);
      console.log("updating flat details", flatDetails);
      await fetch("/api/flats", {
        method: "POST",
        body: JSON.stringify(flatDetails),
      });
      toast.success("Flat details updated");
    } catch (error) {
      console.error(error);
      toast.error("Could not update flat details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {header()}
      <div className="grid gap-4 p-4">
        {Object.entries(flatDetails).map(([flat, details]) => (
          <div key={flat} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Flat {flat}</h2>

            <div className="my-4 mx-1">
              <label>Guest name</label>
              <Input
                name="guestName"
                value={details.guest_name}
                onChange={(e) => {
                  setFlatDetails({
                    ...flatDetails,
                    [flat]: {
                      ...details,
                      guest_name: e.target.value,
                    },
                  });
                }}
                type="text"
                inputMode="text"
              />
            </div>

            <div className="my-4 mx-1">
              <label>Rent</label>
              <Input
                name="rent"
                value={details.rent}
                onChange={(e) => {
                  setFlatDetails({
                    ...flatDetails,
                    [flat]: {
                      ...details,
                      rent: Number(e.target.value),
                    },
                  });
                }}
                type="number"
                inputMode="numeric"
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={async () => {
                await updateFlatDetails(flat, details);
              }}
            >
              Update
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
