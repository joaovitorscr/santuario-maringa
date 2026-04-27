import { adoptionCandidate, adoptionCandidateRelations } from "./adoption-candidate";
import { adoption, adoptionRelations } from "./adoption";
import { account, accountRelations } from "./account";
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
