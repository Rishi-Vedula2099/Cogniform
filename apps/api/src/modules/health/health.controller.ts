import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators/public.decorator";
import { HealthService } from "./health.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Liveness probe" })
  liveness() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }

  @Public()
  @Get("ready")
  @ApiOperation({ summary: "Readiness probe — checks DB + Redis" })
  readiness() {
    return this.health.checkReadiness();
  }
}
