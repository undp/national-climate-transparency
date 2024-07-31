import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Action } from "../casl/action.enum";
import { PoliciesGuardEx } from "../casl/policy.guard";
import { SettingsDto } from "../dtos/settings.dto";
import { ConfigurationSettingsEntity } from "../entities/configuration.settings.entity";
import { ConfigurationSettingsService } from "../util/configurationSettings.service";
import { ConfigurationSettingsType } from "../enums/configuration.settings.type.enum";

@ApiTags("Settings")
@Controller("settings")
@ApiBearerAuth()
export class SettingsController {
  constructor(
    private readonly configurationSettingsService: ConfigurationSettingsService
  ) {}

  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Update, ConfigurationSettingsEntity))
  @Post("update")
  async updateSettings(@Body() settings: SettingsDto, @Request() req) {
    return await this.configurationSettingsService.updateSetting(
      settings.id,
      settings.settingValue,
      req.user
    );
  }

  @UseGuards(JwtAuthGuard, PoliciesGuardEx(true, Action.Read, ConfigurationSettingsEntity))
  @Get('/:id')
  async getSettings(@Param("id") settingsId: ConfigurationSettingsType, @Request() req) {
    return await this.configurationSettingsService.getSetting(settingsId);
  }
}
