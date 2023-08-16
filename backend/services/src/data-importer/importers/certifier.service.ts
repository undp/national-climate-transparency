import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { CompanyService } from "../../shared/company/company.service";
import { ImporterInterface } from "../importer.interface";
import { UserService } from "../../shared/user/user.service";
import * as cheerio from 'cheerio';
import { CompanyRole } from "../../shared/enum/company.role.enum";
import { Role } from "../../shared/casl/role.enum";
import { OrganisationDto } from "../../shared/dto/organisation.dto";
import { UserDto } from "../../shared/dto/user.dto";
import { UserUpdateDto } from "../../shared/dto/user.update.dto";
import { OrganisationUpdateDto } from "../../shared/dto/organisation.update.dto";
@Injectable()
export class CertifierService implements ImporterInterface {
    constructor(
        private logger: Logger,
        private configService: ConfigService,
        private companyService: CompanyService,
        private userService: UserService,
        
    ){}
    async scrape() {
      try {
        const response = await axios.get('https://cdm.unfccc.int/DOE/list/index.html');
        const html = response.data;
        const $ = cheerio.load(html);
        const activeRows = [];                       
        const deactiveRows = [];
        const activeRowElements = $('div:nth-child(2) table:nth-child(3) tbody:nth-child(1) tr');
        for (let index = 0; index < activeRowElements.length; index++) {
            const element = activeRowElements[index];
            const refNumber = $(element).find('td:nth-child(1)').text().trim();
            const entity = $(element).find('td:nth-child(2) a').text().trim();
            const oraganization = entity.replace(/\([^)]*\)/g, '').trim();
            const initialsArray = oraganization.match(/\b\w/g);
            let initials:string
            if (initialsArray) {
              initials = initialsArray.join('');
              // email = 'nce.digital+'+initials+'@undp.org'
            }
            if (typeof refNumber == "string" && refNumber.trim().length != 0){ 
              const url = 'https://cdm.unfccc.int/DOE/list/DOE.html?entityCode='+refNumber; 
              await axios
              .get(url)
              .then( (response) => { 
                const certdata = response.data
                const $ =cheerio.load(certdata);
                const numberTable = $('table.formTable:nth-child(1) tbody:nth-child(1) tr:nth-child(5)');
                let number:string
                numberTable.each( function() {
                    let numberspan = $(this).find('td:nth-child(2)').text().trim();
                    const numbermatch = String(numberspan.match(/Tel:\s*([+0-9\s-]+)/g))
                    const numbers = numbermatch.replace(/^Tel:\s*/, '').trim()
                    const onenumber = numbers.split('\n')
                    const stringnumber = String(onenumber).trim()
                    number = stringnumber.split(',')[0]
                    if (number.startsWith("00")){
                      number = number.replace(/^00/, "+");
                    }
                    
                });
                const addressTable = $('table.address');
                const alternativeAddress = $('table.formTable:nth-child(1) tbody:nth-child(1) tr:nth-child(4)')
                let address:string
                addressTable.each( function() {
                    let addressspan = $(this).find('tbody:nth-child(1)').text().trim();
                    const addressmatch = String(addressspan.match(/Address:\s*([\s\S]*)/g))
                    address = addressmatch.replace(/^Address:\s*/, '').trim()
                  });
                  if (!address){
                    alternativeAddress.each( function(){
                      let alternativeAddresssnap = $(this).find('td:nth-child(2)').text().trim();
                      const removespaces = String(alternativeAddresssnap.split('\n'))
                      const alternativeAddressmatch = String(removespaces.match(/^(.*?)(?= Declaration of other offices \(CDM-DOO-FORM\))/g))
                      address = alternativeAddressmatch
                    })
                    
                  }
                  activeRows.push({
                    refNumber,
                    oraganization,
                    initials,
                    number,
                    address
                
                  });
              })
                
            }
            
        }
        const activeRowsfinal = [...new Map(activeRows.map(item =>
          [item['refNumber'], item])).values()];
        // const ObjectsToCsv = require('objects-to-csv');
        // new ObjectsToCsv(activeRowsfinal).toDisk('./active_users.csv', { append: true });
        
        $('table.formTable:nth-child(7) tbody:nth-child(1) tr').each((index, element) => {
          const refNumber = $(element).find('td:nth-child(1)').text().trim();
          const entity = $(element).find('td:nth-child(2) a').text().trim();
          const oraganization = entity.replace(/\([^)]*\)/g, '').trim();
          if (typeof refNumber == "string" && refNumber.trim().length != 0){ 
            deactiveRows.push({
              refNumber,
              oraganization,
            });
          }
                  
        });
        const deactiveRowsfinal = [...new Map(deactiveRows.map(item =>
          [item['refNumber'], item])).values()];
        // new ObjectsToCsv(deactiveRowsfinal).toDisk('./deactive_users.csv', { append: true });        
        //  console.log('CSV conversion completed.');
      return {activeRowsfinal,deactiveRowsfinal}
    } 
        catch (error) {
            console.error('Error:', error);
        }
    }

    async start(): Promise<any>{
        const {activeRowsfinal,deactiveRowsfinal} = await this.scrape();
        let intials:string
        let number:string
        for(const certifier of activeRowsfinal){
          const email = 'nce.digital+'+certifier.initials+'@undp.org'
          intials = certifier.initials 
          number = certifier.number
          const c = await this.companyService.findByTaxId(certifier.oraganization);
          //Detail Update
          // if(c)
          //   {if(c.name == certifier.oraganization && (c.phoneNo != certifier.number || c.address != certifier.address) ){
          //     const user = new UserUpdateDto();
          //       user.email = 'nce.digital'+intials+'@undp.org' ;
          //       user.phoneNo = certifier.number;
          //   }}
          if (!c) {
            // If email already exist
            let suf=1;
            const u = await this.userService.findOne(email);
            if(u){
              intials = certifier.initials+suf    
            }
            
            if(number=="null"){
                number = "00"
            }   
            try {
              this.logger.log("Certifier Creation Started "+certifier.oraganization)
              const company = new OrganisationDto();
              company.name = certifier.oraganization;
              company.taxId = certifier.oraganization;
              company.logo = this.configService.get("CERTIFIER.image");
              company.email = 'nce.digital+'+intials+'@undp.org' ;
              company.phoneNo = number;
              company.address = certifier.address;
              company.companyRole = CompanyRole.CERTIFIER;
                    
              const user = new UserDto();
              user.email = 'nce.digital+'+intials+'@undp.org' ;
              user.name = certifier.oraganization;
              user.role = Role.Admin;
              user.phoneNo = number;
              user.company = company;
          
              console.log("Adding company", company);
              console.log("Adding user", user);
          
              await this.userService.create(user, -1, CompanyRole.GOVERNMENT);
              this.logger.log("Certifier Creation "+certifier.oraganization+" Complete.")
            } catch (e) {
              this.logger.error(`User ${certifier.oraganization} failed to create`, e);
            }
          }         
        }
        for(const deac_certifiers of deactiveRowsfinal){
          const c = await this.companyService.findByTaxId(deac_certifiers.oraganization);
          if(c){
            this.logger.error(deac_certifiers.oraganization+" This Certifer is withdrawn Deactivate the Account")
          }
        }
    }
    
}