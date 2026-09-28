import { SetMetadata } from "@nestjs/common";
import { Role } from "@prisma/client";

export const ROLES_KEY = "roles";

/**
 * Decorator to require minimum workspace roles for a controller route.
 * Example: `@Roles(Role.OWNER, Role.ADMIN)`
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
