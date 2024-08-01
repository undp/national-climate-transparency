import React from 'react';
import pdfSvg from '../../Assets/FAQ/pdf.svg';
import docSvg from '../../Assets/FAQ/doc.svg';
import xlsxSvg from '../../Assets/FAQ/xlsx.svg';
import txtSvg from '../../Assets/FAQ/txt.svg';
import './faqDocument.scss';

interface Props {
  title: any;
  format: any;
  url: any;
}

const FAQDocuments: React.FC<Props> = ({ title, format, url }) => {
  const handleDownloadClick = () => {
    const doc = document.createElement('a');
    doc.href = url;
    doc.download = title;

    document.body.appendChild(doc);
    doc.click();
    document.body.removeChild(doc);
  };

  const getIconByFormat = () => {
    switch (format) {
      case 'pdf':
        return pdfSvg;
      case 'docx':
        return docSvg;
      case 'xlsx':
        return xlsxSvg;
      default:
        return txtSvg;
    }
  };
  const iconSrc = getIconByFormat();

  return (
    <div className="document">
      {iconSrc && <img src={iconSrc} onClick={handleDownloadClick} />}
      <div className="title">{title}</div>
    </div>
  );
};

export default FAQDocuments;
