import { createFileRoute } from "@tanstack/react-router";
import { ProtocolZero } from "@/components/ProtocolZero";

export const Route = createFileRoute("/")({
  component: ProtocolZero,
});
