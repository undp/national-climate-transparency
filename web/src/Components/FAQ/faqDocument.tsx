import React from 'react';
import pdfsvg from '../../Assets/FAQ/pdf.svg';
import docsvg from '../../Assets/FAQ/doc.svg';
import xlsxsvg from '../../Assets/FAQ/xlsx.svg';
import txtsvg from '../../Assets/FAQ/txt.svg';
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
        return pdfsvg;
      case 'docx':
        return docsvg;
      case 'txt':
        return txtsvg;
      case 'xlsx':
        return xlsxsvg;
      default:
        return null;
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
