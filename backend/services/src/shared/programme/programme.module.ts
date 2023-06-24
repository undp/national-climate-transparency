import { Logger, Module, forwardRef } from "@nestjs/common";
import { ProgrammeService } from "./programme.service";
import { CaslModule } from "../casl/casl.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Programme } from "../entities/programme.entity";
import { UtilModule } from "../util/util.module";
import { ConstantEntity } from "../entities/constants.entity";
import { CompanyModule } from "../company/company.module";
import { Company } from "../entities/company.entity";
import { ProgrammeQueryEntity } from "../entities/programme.view.entity";
import { UserModule } from "../user/user.module";
import { EmailHelperModule } from "../email-helper/email-helper.module";
import { LocationModule } from "../location/location.module";
import { NDCAction } from "../entities/ndc.action.entity";
import { ProgrammeDocument } from "../entities/programme.document";
import { FileHandlerModule } from "../file-handler/filehandler.module";
import { AsyncOperationsModule } from "../async-operations/async-operations.module";
import { NDCActionViewEntity } from "../entities/ndc.view.entity";
import { Investment } from "../entities/investment.entity";
import { InvestmentView } from "../entities/investment.view.entity";
import { ProgrammeDocumentViewEntity } from "../entities/document.view.entity";

@Module({
  imports: [
    CaslModule,
    TypeOrmModule.forFeature([
      Programme,
      ConstantEntity,
      Company,
      ProgrammeQueryEntity,
      NDCAction,
      ProgrammeDocument,
      NDCActionViewEntity,
      Investment,
      InvestmentView,
      ProgrammeDocumentViewEntity
    ]),
    UtilModule,
    forwardRef(() => UserModule),
    forwardRef(() => CompanyModule),
    forwardRef(() => EmailHelperModule),
    LocationModule,
    FileHandlerModule,
    AsyncOperationsModule,
  ],
  providers: [Logger, ProgrammeService],
  exports: [ProgrammeService],
})
export class ProgrammeModule {}
