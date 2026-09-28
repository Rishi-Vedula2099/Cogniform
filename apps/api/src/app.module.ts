import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { validateEnv } from "./config/env.config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./modules/health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AuditModule } from "./modules/audit/audit.module";
import { WorkspacesModule } from "./modules/workspaces/workspaces.module";
import { FormsModule } from "./modules/forms/forms.module";
import { ResponsesModule } from "./modules/responses/responses.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { AiModule } from "./modules/ai/ai.module";
import { UploadModule } from "./modules/upload/upload.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      envFilePath: [".env.local", ".env"],
    }),
    ThrottlerModule.forRoot([
      { ttl: 60_000, limit: 120 },
    ]),
    PrismaModule,
    AuditModule,
    HealthModule,
    AuthModule,
    WorkspacesModule,
    FormsModule,
    ResponsesModule,
    AnalyticsModule,
    IntegrationsModule,
    WebhooksModule,
    NotificationsModule,
    AiModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
