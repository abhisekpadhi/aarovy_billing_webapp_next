'use client';
import { DatePicker } from '@/components/custom/DatePicker';
import { FlatSelect } from '@/components/custom/FlatSelect';
import {
	MonthSelect,
	YearSelect,
} from '@/components/custom/MonthAndYearSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { APICalls } from '@/lib/api';
import { AppCtx, BillType, CacheType, FlatDetailsType } from '@/lib/models';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaArrowLeft } from 'react-icons/fa6';

type BillingContextType = {
	month: string;
	year: string;
	recordedOn: string;
	commonTenants: string;
	commonOpenUnit: string;
	commonCloseUnit: string;
	mainMeterBilled: string;
	mainMeterConsumedUnit: string;
};

export default function NewBillPage() {
	const [formData, setFormData] = useState<BillType>({
		recordedOn: '',
		guestName: '',
		month: '',
		year: '',
		flat: '',
		openingUnit: '',
		closingUnit: '',
		usedUnit: '',
		commonTenants: '1',
		commonOpenUnit: '',
		commonCloseUnit: '',
		commonUsedUnit: '',
		chargeableUnit: '',
		mainMeterBilled: '',
		mainMeterConsumedUnit: '',
		ratePerUnit: '',
		subTotal: '',
		otherMiscCharges: '0',
		societyMaintenanceCharges: '0',
		parkingCharges: '0',
		houseRent: '',
		arrears: '0',
		arrearsDescription: '',
		adjustment: '0',
		adjustmentDescription: '',
		grandTotal: '',
	});

	const [flatDetails, setFlatDetails] = useState<FlatDetailsType | null>(
		null
	);
	const [fetchingPreviousMonth, setFetchingPreviousMonth] = useState(false);

	// recall
	const setCache = (key: string, value: CacheType<BillingContextType>) => {
		localStorage.setItem(key, JSON.stringify(value));
		console.log('setting cached billing context', JSON.stringify(value));
	};

	const getCache = (key: string) => {
		const cache = localStorage.getItem(key);
		if (!cache) return null;
		const parsedCache = JSON.parse(cache) as CacheType<BillingContextType>;
		if (parsedCache.expiresAt < Date.now()) {
			localStorage.removeItem(key);
			return null;
		}

		console.log('getting cached billing context', parsedCache);
		return parsedCache;
	};

	// recall
	useEffect(() => {
		const billingContext = getCache('billingContext');

		if (billingContext) {
			console.log(
				'recordedOn from recall',
				billingContext.data.recordedOn
			);
			setFormData((prev) => ({
				...prev,
				month: billingContext.data.month,
				year: billingContext.data.year,
				recordedOn: billingContext.data.recordedOn,
				commonTenants: billingContext.data.commonTenants,
				commonOpenUnit: billingContext.data.commonOpenUnit,
				commonCloseUnit: billingContext.data.commonCloseUnit,
				mainMeterBilled: billingContext.data.mainMeterBilled,
				mainMeterConsumedUnit:
					billingContext.data.mainMeterConsumedUnit,
			}));
		}
	}, []);

	// when month & year changes, fetch the previous month data, if it exists the flat, pick the closing unit, it will be used as opening unit
	useEffect(() => {
		(async () => {
			if (
				formData.month !== '' &&
				formData.year !== '' &&
				formData.flat !== ''
			) {
				// Calculate previous month and year
				const prevMonth =
					formData.month === '1'
						? '12'
						: (parseInt(formData.month) - 1).toString();
				const prevYear =
					formData.month === '1'
						? (parseInt(formData.year) - 1).toString()
						: formData.year;

				console.log('fetching previous month', prevYear, prevMonth);

				APICalls.fetchBillsByMonth(
					parseInt(prevYear),
					parseInt(prevMonth),
					() => {
						setFetchingPreviousMonth(true);
					},
					(data: BillType[]) => {
						console.log('previous month data', data);
						if (data.length > 0) {
							const matchingBill = data.find(
								(bill) => bill.flat === formData.flat
							);
							if (!matchingBill) {
								toast('No bill found for the previous month');
							}
							setFormData((prev) => ({
								...prev,
								openingUnit: matchingBill?.closingUnit ?? '',
								commonOpenUnit:
									matchingBill?.commonCloseUnit ?? '',
							}));
						}
					},
					(error) => {
						console.error(error);
						toast.error('Error fetching previous month data');
					},
					() => {
						setFetchingPreviousMonth(false);
					}
				);
			}
		})();
	}, [formData.month, formData.year, formData.flat]);

	// when flat changes, update guest name
	useEffect(() => {
		(async () => {
			if (formData.flat === '') {
				return;
			}

			// use from state
			if (flatDetails) {
				setFormData((prev) => ({
					...prev,
					guestName: flatDetails[prev.flat]?.guest_name ?? '',
					houseRent: flatDetails[prev.flat]?.rent.toString() ?? '',
				}));
				return;
			}

			// use from gist
			const flatDetailsResponse = await axios.get('/api/flats');

			setFlatDetails(flatDetailsResponse.data.data);
			if (flatDetailsResponse.data.data) {
				setFormData((prev) => ({
					...prev,
					guestName:
						flatDetailsResponse.data.data[prev.flat]?.guest_name ??
						'',
					houseRent:
						flatDetailsResponse.data.data[
							prev.flat
						]?.rent.toString() ?? '',
				}));
			} else {
				toast.error('Could not fetch flat details');
			}
		})();
	}, [formData.flat, flatDetails]);

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
			const response = await fetch('/api/bills', {
				method: 'POST',
				body: JSON.stringify(formData),
			});
			const data = await response.json();

			const id = `${formData.year}_${formData.month}_${formData.flat}`;
			if (data.success) {
				if (appCtx) {
					const updatedBill = {
						...appCtx.billCached,
						...formData,
					};
					appCtx.setBillCached(updatedBill);
				}
			}
			// get cache, if it does not exist, create it
			const billingContext = getCache('billingContext');
			if (!billingContext) {
				setCache('billingContext', {
					data: {
						month: formData.month,
						year: formData.year,
						recordedOn: formData.recordedOn,
						commonTenants: formData.commonTenants,
						commonOpenUnit: formData.commonOpenUnit,
						commonCloseUnit: formData.commonCloseUnit,
						mainMeterBilled: formData.mainMeterBilled,
						mainMeterConsumedUnit: formData.mainMeterConsumedUnit,
					},
					expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 1 day
					createdAt: Date.now(),
				});
			}
			router.push(`/bills/${id}`);
		} catch (error) {
			console.debug('Error saving bill:', error);
			toast.error('Could not save bill');
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		console.debug('formData in handleSubmit', formData);

		// Flat, Month, Year, Recorded On are required fields
		const missingFields = [];
		if (!formData.flat) missingFields.push('flat');
		if (!formData.month) missingFields.push('month');
		if (!formData.year) missingFields.push('year');
		if (formData.recordedOn === '') missingFields.push('recordedOn');

		if (missingFields.length > 0) {
			toast(`Please select ${missingFields.join(', ')}`, {
				icon: '⚠️',
				style: {
					borderRadius: '10px',
					background: '#000',
					color: '#fff',
				},
			});
			return;
		}

		toast.promise(
			saveBill(),
			{
				loading: 'Saving...',
				success: 'Bill saved successfully',
				error: 'Could not save bill',
			},
			{
				style: {
					borderRadius: '10px',
					background: '#000',
					color: '#fff',
				},
			}
		);
	};

	const router = useRouter();

	const header = () => {
		return (
			<div className='flex items-center mb-4'>
				<Button
					variant={'default'}
					onClick={() => router.back()}
					className='rounded-full w-10 h-10 p-0 flex items-center justify-center'>
					<FaArrowLeft />
				</Button>
				<h1 className='text-2xl font-bold mx-4'>New Bill</h1>
			</div>
		);
	};

	return (
		<div className='flex flex-col h-screen'>
			{header()}
			<form onSubmit={handleSubmit} className='flex-grow pb-20'>
				<div className='my-4 mx-1'>
					<label>Flat</label>
					<FlatSelect
						value={formData.flat}
						onChange={(value) =>
							setFormData((prev) => ({ ...prev, flat: value }))
						}
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Guest name</label>
					<Input
						name='guestName'
						value={formData.guestName}
						onChange={handleChange}
						required
						type='text'
						inputMode='text'
					/>
				</div>
				<div className='grid grid-cols-2 gap-4'>
					<div className='mx-1'>
						<label>Month</label>
						<MonthSelect
							value={formData.month}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									month: value,
								}))
							}
						/>
					</div>
					<div className='mx-1'>
						<label>Year</label>
						<YearSelect
							value={formData.year}
							onChange={(value) =>
								setFormData((prev) => ({
									...prev,
									year: value,
								}))
							}
						/>
					</div>
				</div>

				<div className='my-4 mx-1'>
					<label>Recorded On</label>
					<div>
						<DatePicker
							init={formData?.recordedOn ?? ''}
							setDate={(date) =>
								setFormData((prev) => ({
									...prev,
									recordedOn: date.toLocaleDateString(
										'en-GB',
										{
											day: '2-digit',
											month: '2-digit',
											year: 'numeric',
										}
									),
								}))
							}
						/>
					</div>
				</div>

				<div className='my-4 mx-1'>
					<label>Opening Unit</label>
					{fetchingPreviousMonth ? (
						<div>Loading...</div>
					) : (
						<Input
							name='openingUnit'
							value={formData.openingUnit}
							onChange={handleChange}
							required
							type='number'
							inputMode='numeric'
							pattern='[0-9]*'
						/>
					)}
				</div>
				<div className='my-4 mx-1'>
					<label>Closing Unit</label>
					<Input
						name='closingUnit'
						value={formData.closingUnit}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Used Unit</label>
					<div>{formData.usedUnit}</div>
				</div>

				<div className='my-4 mx-1'>
					<label>Common Tenants</label>
					<Input
						name='commonTenants'
						value={formData.commonTenants}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Common Open Unit</label>
					<Input
						name='commonOpenUnit'
						value={formData.commonOpenUnit}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Common Close Unit</label>
					<Input
						name='commonCloseUnit'
						value={formData.commonCloseUnit}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Common Used Unit</label>
					<div>{formData.commonUsedUnit}</div>
				</div>
				<div className='my-4 mx-1'>
					<label>Chargeable Unit</label>
					<div>{formData.chargeableUnit}</div>
				</div>
				<div className='my-4 mx-1'>
					<label>Main Meter Billed</label>
					<Input
						name='mainMeterBilled'
						value={formData.mainMeterBilled}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Main Meter Consumed Unit</label>
					<Input
						name='mainMeterConsumedUnit'
						value={formData.mainMeterConsumedUnit}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Rate Per Unit</label>
					<div>{formData.ratePerUnit}</div>
				</div>
				<div className='my-4 mx-1'>
					<label>Sub Total</label>
					<div>{formData.subTotal}</div>
				</div>
				<div className='my-4 mx-1'>
					<label>House Rent</label>
					<Input
						name='houseRent'
						value={formData.houseRent}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Other Misc Charges</label>
					<Input
						name='otherMiscCharges'
						value={formData.otherMiscCharges}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Society Maintenance Charges</label>
					<Input
						name='societyMaintenanceCharges'
						value={formData.societyMaintenanceCharges}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Parking Charges</label>
					<Input
						name='parkingCharges'
						value={formData.parkingCharges}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Arrears</label>
					<Input
						name='arrears'
						value={formData.arrears}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='-?[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Arrears Description</label>
					<Input
						name='arrearsDescription'
						value={formData.arrearsDescription}
						onChange={handleChange}
						type='text'
						inputMode='text'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Adjustment</label>
					<Input
						name='adjustment'
						value={formData.adjustment}
						onChange={handleChange}
						required
						type='number'
						inputMode='numeric'
						pattern='-?[0-9]*'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Adjustment Description</label>
					<Input
						name='adjustmentDescription'
						value={formData.adjustmentDescription}
						onChange={handleChange}
						type='text'
						inputMode='text'
					/>
				</div>
				<div className='my-4 mx-1'>
					<label>Grand Total</label>
					<div>{formData.grandTotal}</div>
				</div>
				<Button
					disabled={isLoading}
					type='submit'
					variant={'default'}
					className='w-full rounded-full'>
					{isLoading ? 'Creating...' : 'Create Bill'}
				</Button>
			</form>
		</div>
	);
}
