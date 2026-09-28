import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { ResponsesService } from "./responses.service";
import { Public } from "../../common/decorators/public.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller()
export class ResponsesController {
  constructor(private readonly responsesService: ResponsesService) {}

  @Public()
  @Get("public/forms/:slug")
  getPublicForm(@Param("slug") slug: string) {
    return this.responsesService.getPublicForm(slug);
  }

  @Public()
  @Post("public/forms/:slug/responses")
  @HttpCode(HttpStatus.CREATED)
  submitResponse(
    @Param("slug") slug: string,
    @Body()
    body: {
      answers: Record<string, any>;
      duration?: number;
      metadata?: Record<string, any>;
    },
    @Req() req: Request,
  ) {
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress;
    const userAgent = req.headers["user-agent"];
    return this.responsesService.submitResponse(slug, body, { ip, userAgent });
  }

  @Get("responses/forms/:formId")
  @UseGuards(JwtAuthGuard)
  getFormResponses(@Param("formId") formId: string) {
    return this.responsesService.getFormResponses(formId);
  }

  @Get("responses/forms/:formId/export")
  @UseGuards(JwtAuthGuard)
  async exportCsv(@Param("formId") formId: string, @Res() res: Response) {
    const csvContent = await this.responsesService.exportCsv(formId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="form-responses-${formId}.csv"`);
    res.status(HttpStatus.OK).send(csvContent);
  }
}
