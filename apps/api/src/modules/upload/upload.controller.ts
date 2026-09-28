import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Public } from "../../common/decorators/public.decorator";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Public()
  @Post("presigned-url")
  getPresignedUrl(
    @Body("fileName") fileName: string,
    @Body("contentType") contentType: string,
  ) {
    return this.uploadService.getPresignedUploadUrl(fileName, contentType || "application/octet-stream");
  }
}
