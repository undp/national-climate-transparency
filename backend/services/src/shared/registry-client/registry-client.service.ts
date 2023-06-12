import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UserDto } from "../dto/user.dto";
import axios from "axios";

@Injectable()
export class RegistryClientService {
  constructor(private configService: ConfigService, private logger: Logger) {}

  public async createCompany(userDto: UserDto) {
    if (!this.configService.get("registry.syncEnable")) {
      this.logger.debug("Company created ignored due to registry sync disable");
      return;
    }

    return await axios.post(
      this.configService.get("registry.endpoint") + "/national/user/add",
      userDto,
      {
        headers: {
          api_key: `${this.configService.get("registry.apiToken")}`,
        },
      }
    );
  }
}
