import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../../config/env.config";
import * as crypto from "crypto";

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService<Env>) {}

  /**
   * Generate a signed upload URL and public destination URL for file upload fields.
   */
  async getPresignedUploadUrl(fileName: string, contentType: string) {
    if (!fileName) throw new BadRequestException("File name is required");

    const fileExt = fileName.split(".").pop() || "bin";
    const uniqueKey = `uploads/${Date.now()}-${crypto.randomBytes(8).toString("hex")}.${fileExt}`;

    const publicUrl = `${this.configService.get("API_URL")}/public/uploads/${uniqueKey}`;

    return {
      uploadUrl: publicUrl,
      publicUrl,
      key: uniqueKey,
      expiresIn: 3600,
    };
  }
}
