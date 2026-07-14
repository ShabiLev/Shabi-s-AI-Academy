import type { AcademyUser } from "../auth";
export function isVerifiedAdmin(user: AcademyUser | null): boolean { return user?.accountType==="cloud"&&user.roleSource==="verified-claim"&&user.role==="admin"; }
