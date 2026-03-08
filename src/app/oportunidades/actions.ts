"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const createOpportunitySchema = z.object({
  name: z.string().min(3),
  account_id: z.string().uuid(),
  unit_asset: z.string().min(2),
  segment: z.string().min(2),
  service_type: z.string().min(2),
  main_discipline: z.string().min(2),
  stage: z.string().min(2),
  estimated_value: z.coerce.number().nonnegative(),
  probability: z.coerce.number().min(0).max(100),
});

export async function createOpportunity(formData: FormData) {
  const { supabase, user } = await requireUser();

  const parsed = createOpportunitySchema.safeParse({
    name: formData.get("name"),
    account_id: formData.get("account_id"),
    unit_asset: formData.get("unit_asset"),
    segment: formData.get("segment"),
    service_type: formData.get("service_type"),
    main_discipline: formData.get("main_discipline"),
    stage: formData.get("stage"),
    estimated_value: formData.get("estimated_value"),
    probability: formData.get("probability"),
  });

  if (!parsed.success) {
    return { error: "Dados obrigatórios não preenchidos corretamente." };
  }

  const payload = {
    ...parsed.data,
    code: `OP-${Date.now()}`,
    owner_user_id: user.id,
    created_by: user.id,
    updated_by: user.id,
  };

  const { error } = await supabase.from("opportunities").insert(payload);

  if (error) {
    return { error: "Não foi possível criar a oportunidade." };
  }

  revalidatePath("/oportunidades");
  return { success: true };
}
