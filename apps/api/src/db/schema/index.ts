import { adoptionCandidate, adoptionCandidateRelations } from "./adoption-candidate";
import { adoption, adoptionRelations } from "./adoption";
import { account, accountRelations } from "./account";
import {
  adminPermission,
  adminPermissionRelations,
  adminRole,
  adminRolePermission,
  adminRolePermissionRelations,
  adminRoleRelations,
} from "./admin-role";
import { cat, catRelations } from "./cat";
import { furType, furTypeRelations } from "./fur-type";
import { session, sessionRelations } from "./session";
import { user, userRelations } from "./user";
import { verification } from "./verification";

export const schema = {
  adoption,
  adoptionRelations,
  adoptionCandidate,
  adoptionCandidateRelations,
  account,
  accountRelations,
  adminPermission,
  adminPermissionRelations,
  adminRole,
  adminRolePermission,
  adminRolePermissionRelations,
  adminRoleRelations,
  cat,
  catRelations,
  furType,
  furTypeRelations,
  session,
  sessionRelations,
  verification,
  user,
  userRelations,
};
