import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileHandlerInterface } from '../file-handler/filehandler.interface';
const PDFDocument = require('pdfkit');
const util = require('util');
@Injectable()
export class ObjectionLetterGen {
    constructor(private configService: ConfigService, private fileHandler: FileHandlerInterface,) {
    }

    public generateReport = async (orgs, programmeName, programmeId) => {

        const minister = this.configService.get('docGenerate.ministerName')
        const ministry = this.configService.get('docGenerate.ministryName')
        const country = this.configService.get('systemCountryName');
        const capital = this.configService.get('docGenerate.countryCapital');

        const filepath = `NO_OBJECTION_LETTER_${programmeId}.pdf`

        const date = new Date().toDateString();
        let orgName;
        if (orgs.length > 2) {
            orgName = orgs.slice(0, orgs.length - 1).join(', ');
            orgName += ' and ' + orgs[orgs.length - 1]
        } else {
            orgName = orgs.join(' and ')
        }
        // Create a document
        const doc = new PDFDocument();
        const endAsync = util.promisify(doc.end.bind(doc));
        // const buffers = [];
        // doc.on('data', (chunk) => buffers.push(chunk));
        // await doc.on('end', async () => {
        //     // Concatenate all the chunks into a single buffer
        //     const pdfBytes = Buffer.concat(buffers);
        //     console.log('PDF generate end', 'documents/' + filepath)
        //     await this.fileHandler.uploadFile('documents/' + filepath, pdfBytes.toString('base64'))
        //     console.log('PDF generate done', pdfBytes.toString('base64'))
        // });
    
        // Pipe its output somewhere, like to a file or HTTP response
        // See below for browser usage
        // doc.pipe(stream);
    
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
        await endAsync();
        const pdfBytes = doc.buffer();
        console.log('PDF generate end', 'documents/' + filepath)
        await this.fileHandler.uploadFile('documents/' + filepath, pdfBytes.toString('base64'))
        console.log('PDF generate done', pdfBytes.toString('base64'))
    }
}
