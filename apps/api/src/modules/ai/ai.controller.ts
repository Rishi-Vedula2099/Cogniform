import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AiService } from "./ai.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser, AuthUser } from "../../common/decorators/current-user.decorator";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("generate-form")
  generateForm(
    @CurrentUser() user: AuthUser,
    @Body() body: { prompt: string; workspaceId: string },
  ) {
    return this.aiService.generateForm(body.prompt, body.workspaceId, user.id);
  }

  @Post("suggest-questions")
  suggestQuestions(@Body("topic") topic: string) {
    return this.aiService.suggestQuestions(topic);
  }

  @Post("recommend-validations")
  recommendValidations(@Body("fieldType") fieldType: string) {
    return this.aiService.recommendValidations(fieldType);
  }
}
