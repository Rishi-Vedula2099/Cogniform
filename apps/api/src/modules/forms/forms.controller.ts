import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { FormsService } from "./forms.service";
import { CreateFormDto, UpdateFormDto, CreateFieldDto } from "./dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";
import { LogicAction, LogicOperator } from "@prisma/client";

@Controller("forms")
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFormDto,
  ) {
    return this.formsService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query("workspaceId") workspaceId: string,
  ) {
    return this.formsService.findAllInWorkspace(workspaceId, user.id);
  }

  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.findOne(id, user.id);
  }

  @Get(":id/versions")
  getVersions(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.getVersions(id, user.id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateFormDto,
  ) {
    return this.formsService.update(id, user.id, dto);
  }

  @Delete(":id")
  delete(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.delete(id, user.id);
  }

  @Post(":id/sections")
  addSection(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body("title") title?: string,
  ) {
    return this.formsService.addSection(id, user.id, title);
  }

  @Delete("sections/:sectionId")
  deleteSection(
    @Param("sectionId") sectionId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.deleteSection(sectionId, user.id);
  }

  @Post("sections/:sectionId/fields")
  addField(
    @Param("sectionId") sectionId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateFieldDto,
  ) {
    return this.formsService.addField(sectionId, user.id, dto);
  }

  @Patch("fields/:fieldId")
  updateField(
    @Param("fieldId") fieldId: string,
    @CurrentUser() user: AuthUser,
    @Body() body: any,
  ) {
    return this.formsService.updateField(fieldId, user.id, body);
  }

  @Delete("fields/:fieldId")
  deleteField(
    @Param("fieldId") fieldId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.deleteField(fieldId, user.id);
  }

  @Post("fields/:fieldId/logic")
  addLogicRule(
    @Param("fieldId") fieldId: string,
    @CurrentUser() user: AuthUser,
    @Body()
    body: {
      action: LogicAction;
      operator: LogicOperator;
      value?: string;
      targetFieldId?: string;
    },
  ) {
    return this.formsService.addLogicRule(fieldId, user.id, body);
  }

  @Delete("logic/:ruleId")
  deleteLogicRule(
    @Param("ruleId") ruleId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.formsService.deleteLogicRule(ruleId, user.id);
  }

  @Patch(":id/reorder")
  reorder(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Body() payload: any,
  ) {
    return this.formsService.reorder(id, user.id, payload);
  }
}
