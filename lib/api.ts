import { BillType } from "./models";

const fetchBillsByMonth = async (
  year: number,
  month: number,
  beforeStart: () => void,
  onSuccess: (data: BillType[]) => void,
  onError: (error: unknown) => void,
  onFinally: () => void
) => {
  try {
    beforeStart();
    const response = await fetch(`/api/bills?year=${year}&month=${month}`);
    const data = await response.json();
    if (data.success) {
      onSuccess(data.data);
    } else {
      onError(data.message);
    }
  } catch (error) {
    onError(error);
  } finally {
    onFinally();
  }
};

export const APICalls = { fetchBillsByMonth };
