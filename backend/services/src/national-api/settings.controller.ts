import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { Action } from "src/casl/action.enum";
import { PoliciesGuardEx } from "src/casl/policy.guard";
import { SettingsDto } from "src/dtos/settings.dto";
import { ConfigurationSettings } from "src/entities/configuration.settings";
import { ConfigurationSettingsService } from "src/util/configurationSettings.service";

@ApiTags("Settings")
@Controller("Settings")
@ApiBearerAuth()
export class SettingsController {
  constructor(
    private readonly configurationSettingsService: ConfigurationSettingsService
  ) {}

  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ConfigurationSettings))
  @Post("update")
  async updateSettings(@Body() settings: SettingsDto, @Request() req) {
    return await this.configurationSettingsService.updateSetting(
      settings.id,
      settings.settingValue
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get("query")
  async getSettings(@Query("id") settingsId: number, @Request() req) {
    return await this.configurationSettingsService.getSetting(settingsId);
  }
}
