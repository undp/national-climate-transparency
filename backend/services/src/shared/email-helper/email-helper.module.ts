import { forwardRef, Module } from '@nestjs/common';
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { CompanyModule } from '../company/company.module';
import { UserModule } from '../user/user.module';
import { UtilModule } from '../util/util.module';
import { EmailHelperService } from './email-helper.service';
import { ProgrammeModule } from '../programme/programme.module';

@Module({
    providers: [EmailHelperService],
    exports: [EmailHelperService],
    imports: [forwardRef(() => UserModule), forwardRef(() => CompanyModule), AsyncOperationsModule, UtilModule,  forwardRef(() => ProgrammeModule)]
})
export class EmailHelperModule {}
