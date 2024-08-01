import { Injectable } from "@nestjs/common";
import * as fs from 'fs';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
import { ExportFileType } from "../enums/shared.enum";
import { DataExportDto } from "../dtos/data.export.dto";
import * as XLSX from 'xlsx';

@Injectable()
export class DataExportService {
  constructor(private fileHandler: FileHandlerInterface,) {

  };

	async generateCsvOrExcel(data: DataExportDto[], headers: string[], fileName: string, fileType: ExportFileType) {

		const currentDate = new Date();
		const year = currentDate.getFullYear();
		const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
		const day = currentDate.getDate().toString().padStart(2, '0');
		const hours = currentDate.getHours().toString().padStart(2, '0');
		const minutes = currentDate.getMinutes().toString().padStart(2, '0');
		const seconds = currentDate.getSeconds().toString().padStart(2, '0');
	
		const formattedDateTime = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
		const fileExtension = fileType === ExportFileType.CSV ? 'csv' : 'xlsx';
		const outputFileName = `${fileName}_${formattedDateTime}.${fileExtension}`;
	
		if (fileType === ExportFileType.CSV) {
			let csvContent = '';
	
			const refinedData = [];
			refinedData.push(headers);
	
			data.forEach(item => {
				const values = Object.values(item).map(value => (value === undefined || value === null) ? "" : value);
				refinedData.push(values);
			});
	
			refinedData.forEach(row => {
				const rowValues = row.map(value => `"${value}"`).join(',');
				csvContent += rowValues + '\n';
			});
	
			fs.writeFileSync(outputFileName, csvContent);
		} else if (fileType === ExportFileType.XLSX) {
			const worksheetData = [headers, ...data.map(item => Object.values(item).map(value => {
				if (Array.isArray(value)) {
					return value.join('; '); // Convert array to a semicolon-separated string
				}
				return value === undefined || value === null ? "" : value;
			}))];
	
			const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
			XLSX.writeFile(workbook, outputFileName);
		}
	
		const content = fs.readFileSync(outputFileName, { encoding: 'base64' });
		const url = await this.fileHandler.uploadFile('documents/exports/' + outputFileName, content);
	
		console.log('Export completed', 'exports/', url);
		return { url, outputFileName };
	}
}


