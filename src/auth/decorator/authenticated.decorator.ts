import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";

import { FirebaseGuard, SelfMatcherGuard } from "@wallio/auth/guards";

export function Authenticated({
  selfMatcher = "",
}: { selfMatcher?: string } = {}) {
  return applyDecorators(
    SetMetadata("self-matcher", selfMatcher),
    UseGuards(FirebaseGuard, SelfMatcherGuard),
    ApiBearerAuth()
  );
}
