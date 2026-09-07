import { createFileRoute } from "@tanstack/react-router";
import {
  AdminHome,
  DispatchHome,
  HrHome,
  OfficeHome,
  OwnerHome,
  PickupHome,
  SafetyHome,
} from "@/components/desk/homes";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/today")({ component: Today });

function Today() {
  const role = useHaul((s) => s.role);
  if (role === "owner") return <OwnerHome />;
  if (role === "dispatcher") return <DispatchHome />;
  if (role === "hr") return <HrHome />;
  if (role === "backoffice") return <OfficeHome />;
  if (role === "safety") return <SafetyHome />;
  if (role === "admin") return <AdminHome />;
  return <PickupHome />;
}
