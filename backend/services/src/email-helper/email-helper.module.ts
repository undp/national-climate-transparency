import { forwardRef, Module } from '@nestjs/common';
import { AsyncOperationsModule } from '../async-operations/async-operations.module';
import { UserModule } from '../user/user.module';
import { UtilModule } from '../util/util.module';
import { EmailHelperService } from './email-helper.service';
import { OrganisationModule } from 'src/organisation/organisation.module';

@Module({
    providers: [EmailHelperService],
    exports: [EmailHelperService],
    imports: [forwardRef(() => UserModule), forwardRef(() => OrganisationModule), AsyncOperationsModule, UtilModule]
})
export class EmailHelperModule {}
