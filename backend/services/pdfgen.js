const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateReport = (filepath, capital, date, orgs, programmeName, country, ministry, programmeId) => {

    const minister = 'Pohamba Penomwenyo Shifeta'

    let orgName;
    if (orgs.length > 2) {
        orgName = orgs.slice(0, orgs.length - 1).join(', ');
        orgName += ' and ' + orgs[orgs.length - 1]
    } else {
        orgName = orgs.join(' and ')
    }
    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    // See below for browser usage
    doc.pipe(fs.createWriteStream('output.pdf'));

    // Embed a font, set the font size, and render some text
    doc
    .fontSize(8)
    .text(capital + ', ' + date, {
        align: 'right'
    });

    doc.fontSize(9);
    doc
    .font('fonts/Inter-Bold.ttf')
    .text(`\n\nRe: Programme Design Document by ${orgName} regarding ${programmeName}`);

    
    doc
    .text('\n\nNo Objection Letter', {
        align: 'center'
    });

    doc.fontSize(9).font('fonts/Inter-Regular.ttf');

    doc.text(`\nTo Whom It May Concern,\n\nWe refer to the programme titled ${programmeName} in ${country} as included in the funding proposal submitted by ${orgName} to us on ${date}.\n\nThe undersigned is the duly authorized representative of the ${ministry} of Government of ${country}.\n\nPursuant to the regulations for Article 6.2 of the Paris Agreement in ${country}, the content of which we acknowledge to have reviewed, we hereby confirm no conflict with these regulations and communicate our no-objection to the programme as included in the funding proposal.`)
    
    doc
    .text(`\n\nBy communicating our no-objection, it is implied that:\n\n`);

    doc
    .text(`(a) The government of ${country} has no-objection to the programme as included in the carbon credit proposal;\n\n(b) The programme as described in the proposal is in conformity with the national priorities, strategies and plans for internationally transferable mitigation outcomes of ${country};\n\n(c) In accordance with the ${country}'s environmental and social safeguards, the programme as included in the funding proposal is in conformity with relevant national laws and regulations.\n\n(d) This letter does not prejudicate later authorization for transfer.`);

    doc.text(`\n\nWe confirm that our national process for ascertaining no-objection to the programme as included in the proposal has been duly followed.\n\nWe confirm that our no-objection applies to all projects or activities to be implemented within the scope of the programme.\n\nWe acknowledge that this letter will be made publicly available on the Carbon Transparency website, registered under ${programmeId}.`)

    doc.text(`\n\nSincerely,\nHonorable ${minister}\nMinister\n${ministry}Government of ${country}`)
    // Finalize PDF file
    doc.end();
}

generateReport('output.pdf', 'Windhoek', '2022/01/01', ['Xeptagon PVT LTD', 'Ustocktrade LLC',  'Google LLC'], 'Food Programme Phase 1', 'Namibia', 'Environment Ministry', '123')