import { AcceptedFileExtensions } from '../Enums/file.enum';

export type UploadData = { key: string; title: string; data: string };

export type StoredData = { key: string; title: string; url: string };

export const acceptedFileTypes = '.xlsx,.xls,.ppt,.pptx,.docx,.csv,.png,.jpg,.pdf';

export const extensionColors = {
  [AcceptedFileExtensions.xlsx]: '#207245', // Green, matching Excel
  [AcceptedFileExtensions.xls]: '#185C37', // Darker green, matching older Excel
  [AcceptedFileExtensions.ppt]: '#D04423', // Orange, matching PowerPoint
  [AcceptedFileExtensions.pptx]: '#D04423', // Same orange as ppt, consistency for PowerPoint
  [AcceptedFileExtensions.docx]: '#4DA6FF', // Blue, matching Word
  [AcceptedFileExtensions.csv]: '#207245', // Same green as xlsx, since CSVs are often opened in Excel
  [AcceptedFileExtensions.png]: '#C55BBC', // Light red, neutral for images
  [AcceptedFileExtensions.jpg]: '#9E8CF0', // Light purple, neutral for images
  [AcceptedFileExtensions.pdf]: '#FF0000', // Red, matching PDF (Adobe)
};
