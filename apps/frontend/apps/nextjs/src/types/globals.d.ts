import type { User } from "@saasfly/auth"

export {}

declare global {
  interface CustomJwtSessionClaims {
    user?: User & {
      id: string;
      isAdmin: boolean;
    }
  }
}
