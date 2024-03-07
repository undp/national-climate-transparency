import { NestFactory } from "@nestjs/core";
// import { LocationInterface, LocationModule, getLogger } from "@undp/carbon-services-lib";
// import { ProgrammeService,ProgrammeModule,Country,UtilModule, LocationInterface,LocationModule,CountryService} from "@undp/carbon-services-lib";
import { OrganisationDto as OrganisationDto } from "../dtos/organisation.dto";
import { Handler } from "aws-lambda";
import { ConfigService } from "@nestjs/config";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { OrganisationType } from "src/enums/organisation.type.enum";
import { Role } from "src/casl/role.enum";
import { OrganisationModule } from "src/organisation/organisation.module";
import { OrganisationService } from "src/organisation/organisation.service";
import { UserDto } from "src/dtos/user.dto";
import { UtilModule } from "src/util/util.module";
import { CountryService } from "src/util/country.service";
import { Country } from "src/entities/country.entity";
import { getLogger } from "src/server";
import { LocationModule } from "src/location/location.module";
import { LocationInterface } from "src/location/location.interface";
// import { LedgerDbModule } from "../shared/ledger-db/ledger-db.module";
// import { LedgerDBInterface } from "../shared/ledger-db/ledger.db.interface";
const fs = require("fs");

export const handler: Handler = async (event) => {
  console.log(`Setup Handler Started with: ${event}`);

  if (!event) {
    event = process.env;
  }

  const companyApp = await NestFactory.createApplicationContext(
    OrganisationModule,
    {
      logger: getLogger(OrganisationModule),
    }
  );

  const userApp = await NestFactory.createApplicationContext(UserModule, {
    logger: getLogger(UserModule),
  });
  const userService = userApp.get(UserService);
  const companyService = companyApp.get(OrganisationService);
  const configService = companyApp.get(ConfigService);

  const locationApp = await NestFactory.createApplicationContext(
    LocationModule,
    {
      logger: getLogger(UserModule),
    }
  );
  const locationInterface = locationApp.get(LocationInterface);
  const regionRawData = fs.readFileSync('regions.csv', 'utf8');
  await locationInterface.init(regionRawData);

  if (event.type === "IMPORT_USERS" && event.body) {

    const users = event.body.split("\n");

    let c = 0;
    for (const user of users) {
      c++;
      if (c === 1) {
        continue;
      }
      let fields = user.split(",");
      if (fields.length < 7) {
        continue;
      }
      fields = fields.map(f => f.trim())
      // (name: string, companyRole: CompanyRole, taxId: string, password: string, email: string, userRole: string
      const cr =
        fields[4] == "Government"
          ? OrganisationType.GOVERNMENT
          : fields[4] == "Department"
          ? OrganisationType.DEPARTMENT
          : OrganisationType.API;
      const ur =
        fields[5] == "admin"
          ? Role.Admin
          : fields[5] == "DepartmentUser"
          ? Role.DepartmentUser
          : Role.ViewOnly;
      const txId = fields[3];
      console.log('Inserting user', fields[0],
      cr,
      fields[3],
      fields[1],
      ur,
      fields[2])
      try {
        await userService.createUserWithPassword(
          fields[0],
          cr,
          txId,
          fields[6],
          fields[1],
          ur,
          fields[2],
          (cr === OrganisationType.API && fields.length > 7) ? fields[7] : undefined
        );
      } catch (e) {
        console.log('Fail to create user', fields[1])
      }
     
    }
    return;
  }

  if (event.type === "IMPORT_ORG" && event.body) {
    

    const companies = event.body.split("\n");

    let c = 0;
    for (const company of companies) {
      c++;
      if (c === 1) {
        continue;
      }
      let fields = company.split(",");
      if (fields.length < 5) {
        continue;
      }
      fields = fields.map(f => f.trim())
      // (name: string, companyRole: CompanyRole, taxId: string, password: string, email: string, userRole: string
      const cr = fields[4] == "API"
          ? OrganisationType.API
          : OrganisationType.DEPARTMENT;

      const secScope = fields[4] === "Department" && fields[5] ? fields[5].split("-") : undefined;

      try {
        const org = await companyService.create({
          // taxId: fields[3],
          organisationId: fields[3],
          // paymentId: undefined,
          name: fields[0],
          email: fields[1],
          phoneNo: fields[2],
          // nameOfMinister: undefined,
          sector: secScope,
          // ministry: undefined,
          // govDep: undefined,
          website: undefined,
          address: configService.get("systemCountryName"),
          logo: undefined,
          country: configService.get("systemCountry"),
          organisationType: cr,
          createdTime: undefined,
          regions: [],
          // state: undefined //double check this
        });
        console.log('Company created', org)
      } catch (e) {
        console.log('Fail to create company', fields[1], e)
      }
    }
    return;
  }

  // if (event.type === "UPDATE_COORDINATES") {
  //   const prApp = await NestFactory.createApplicationContext(ProgrammeModule, {
  //     logger: getLogger(ProgrammeModule),
  //   });
  //   const programmeService = prApp.get(ProgrammeService);
  //   await programmeService.regenerateRegionCoordinates();
  //   return;
  // }

  const u = await userService.findOne(event["rootEmail"]);
  if (u != undefined) {
    console.log("Root user already created and setup is completed");
  }

  // const app = await NestFactory.createApplicationContext(LedgerDbModule, {
  //   logger: getLogger(LedgerDbModule),
  // });
  // try {
  //   const ledgerModule = app.get(LedgerDBInterface);

  //   await ledgerModule.createTable("company");
  //   await ledgerModule.createIndex("txId", "company");

  //   await ledgerModule.createTable("overall");
  //   await ledgerModule.createIndex("txId", "overall");
  //   const creditOverall = new CreditOverall();
  //   creditOverall.credit = 0;
  //   creditOverall.txId = event["systemCountryCode"];
  //   creditOverall.txRef = "genesis block";
  //   creditOverall.txType = TxType.ISSUE;
  //   await ledgerModule.insertRecord(creditOverall, "overall");
  //   await ledgerModule.createTable();
  //   await ledgerModule.createIndex("programmeId");
  //   console.log("QLDB Table created");
  // } catch (e) {
  //   console.log("QLDB table does not create", e);
  // }

  try {
    const company = new OrganisationDto();
    company.country = event["systemCountryCode"];
    company.name = event["name"];
    company.logo = event["logoBase64"];
    company.organisationType = OrganisationType.GOVERNMENT;
    company.email = event["rootEmail"];
    // company.taxId = `00000${event["systemCountryCode"]}`

    console.log("Adding company", company);
    

    const gov = await companyService.create(company, true);

    const user = new UserDto();
    user.email = event["rootEmail"];
    user.name = "Root";
    user.role = Role.Root;
    user.phoneNo = "-";
    user.organisationId = gov.organisationId;
    user.country = event["systemCountryCode"];
    console.log("Adding user", user);
    await userService.create(user, gov.organisationId, OrganisationType.GOVERNMENT);
    
  } catch (e) {
    console.log(`User ${event["rootEmail"]} failed to create`, e);
  }

  const countryData = fs.readFileSync("countries.json", "utf8");
  const jsonCountryData = JSON.parse(countryData);
  const utils = await NestFactory.createApplicationContext(UtilModule);
  const countryService = utils.get(CountryService);

  jsonCountryData.forEach(async (countryItem) => {
    if (countryItem["UN Member States"] === "x") {
      const country = new Country();
      country.alpha2 = countryItem["ISO-alpha2 Code"];
      country.alpha3 = countryItem["ISO-alpha3 Code"];
      country.name = countryItem["English short"];
      await countryService.insertCountry(country);
    }
  });
};
