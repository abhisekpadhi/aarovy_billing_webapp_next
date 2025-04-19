'use client';
import { Button } from '@/components/ui/button';
import { BillType } from '@/lib/models';
import { MonthNumberToName } from '@/lib/utils';
import pdfMake from 'pdfmake';
import { FaRegFilePdf } from 'react-icons/fa6';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _pdfMake = pdfMake as any;

_pdfMake.fonts = {
	// download default Roboto font from cdnjs.com
	Roboto: {
		normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
		bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
		italics:
			'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
		bolditalics:
			'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
	},
};

export function generateBillPDF(data: BillType) {
	// Define the document structure
	const docDefinition = {
		pageMargins: [40, 20, 40, 20], // [left, top, right, bottom]
		content: [
			{
				text: 'AAROVY',
				style: 'header',
				alignment: 'center',
				bold: true,
			},
			{
				text: `Flat/Meter No.: ${data.flat}, Guest: ${data.guestName}`,
				alignment: 'center',
				margin: [0, 5],
			},
			{
				text: [
					`For the month of ${MonthNumberToName(
						parseInt(data.month)
					)} ${data.year}, `,
					`Recorded on dt. ${data.recordedOn}`,
				],
				alignment: 'center',
				margin: [0, 5],
			},
			{
				table: {
					headerRows: 0,
					widths: ['8%', '70%', '22%'],
					body: [
						[
							{ text: '', alignment: 'center', bold: true },
							{
								text: 'Description',
								alignment: 'center',
								bold: true,
							},
							{
								text: 'Value (₹)',
								alignment: 'center',
								bold: true,
							},
						],
						[
							{ text: 'A', margin: [0, 2], alignment: 'center' },
							{
								text: `Opening unit: ${data.openingUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'B', margin: [0, 2], alignment: 'center' },
							{
								text: `Closing unit: ${data.closingUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'C', margin: [0, 2], alignment: 'center' },
							{
								text: `Used unit: ${data.usedUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'D', margin: [0, 2], alignment: 'center' },
							{
								text: `Common tenants: ${data.commonTenants}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'E', margin: [0, 2], alignment: 'center' },
							{
								text: `Common open unit: ${data.commonOpenUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'F', margin: [0, 2], alignment: 'center' },
							{
								text: `Common close unit ${data.commonCloseUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'G', margin: [0, 2], alignment: 'center' },
							{
								text: `Common used unit ((F-E)/D): ${data.commonUsedUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'H', margin: [0, 2], alignment: 'center' },
							{
								text: `Chargeable unit (C+G): ${data.chargeableUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'I', margin: [0, 2], alignment: 'center' },
							{
								text: `Main meter billed: ${data.mainMeterBilled}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'J', margin: [0, 2], alignment: 'center' },
							{
								text: `Main meter consumed unit: ${data.mainMeterConsumedUnit}`,
								margin: [0, 2],
							},
							{ text: '', margin: [0, 2] },
						],
						[
							{ text: 'K', margin: [0, 2], alignment: 'center' },
							{
								text: `Rate per unit (I/J): ${data.ratePerUnit.toString()}`,
								margin: [0, 2],
							},
							{
								text: '',
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'L', margin: [0, 2], alignment: 'center' },
							{ text: 'Subtotal (H x K)', margin: [0, 2] }, 
							{
								text: data.subTotal.toString(),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'M', margin: [0, 2], alignment: 'center' },
							{ text: 'Other misc. charges', margin: [0, 2] },
							{
								text: Number(data.otherMiscCharges).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'N', margin: [0, 2], alignment: 'center' },
							{
								text: 'Society maintenance charges',
								margin: [0, 2],
							},
							{
								text: Number(
									data.societyMaintenanceCharges
								).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'O', margin: [0, 2], alignment: 'center' },
							{ text: 'Parking charges', margin: [0, 2] },
							{
								text: Number(data.parkingCharges).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'P', margin: [0, 2], alignment: 'center' },
							{
								text: `House rent for month ${MonthNumberToName(
									parseInt(data.month)
								)} ${data.year}`,
								margin: [0, 2],
							},
							{
								text: Number(data.houseRent).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'Q', margin: [0, 2], alignment: 'center' },
							{
								text: ['Arrears', data.arrearsDescription].join(
									'\n'
								),
								margin: [0, 2],
							},
							{
								text: Number(data.arrears).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'R', margin: [0, 2], alignment: 'center' },
							{
								text: [
									'Adjustment',
									data.adjustmentDescription,
								].join('\n'),
								margin: [0, 2],
							},
							{
								text: Number(data.adjustment).toFixed(2),
								alignment: 'right',
								margin: [0, 2],
							},
						],
						[
							{ text: 'S', margin: [0, 2], alignment: 'center' },
							{
								text: 'Grand total (L+M+N+O+P+Q+R)',
								margin: [0, 2],
							},
							{
								text: data.grandTotal.toString(),
								alignment: 'right',
								margin: [0, 2],
								bold: true,
								fillColor: '#000000',
								color: '#FFFFFF',
							},
						],
					],
				},
				layout: {
					paddingLeft: function () {
						return 8;
					},
					paddingRight: function () {
						return 8;
					},
					paddingTop: function () {
						return 5;
					},
					paddingBottom: function () {
						return 5;
					},
				},
			},

			{
				text: 'Kindly deposit by 5th of every month. UPI ID: aarovy@axl',
				alignment: 'center',
				margin: [0, 20],
				bold: true,
			},
		],
		styles: {
			header: {
				fontSize: 18,
				bold: true,
				margin: [0, 10],
			},
		},
	};

	// Create the PDF document
	const pdfDoc = _pdfMake.createPdf(docDefinition);

	// Return an object with methods to handle the PDF
	return {
		open: () => pdfDoc.open(),
		download: (
			filename = `bill_${data.year}_${data.month}_${data.flat}.pdf`
		) => pdfDoc.download(filename),
		print: () => pdfDoc.print(),
	};
}

export default function BillsPDFPage(props: { bill: BillType }) {
	return (
		<div className='mt-2'>
			<Button
				className='w-full'
				onClick={() => {
					// Generate PDF and get blob URL
					generateBillPDF(props.bill).open();
				}}>
				<FaRegFilePdf className='mr-2' /> Generate PDF
			</Button>
		</div>
	);
}
