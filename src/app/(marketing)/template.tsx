// Shader owns its section transitions. A page-wide filter (even blur(0px))
// creates a containing block that breaks ScrollTrigger's fixed pins and
// viewport overlays. Do not add a filter/transform wrapper around this tree.
export default function MarketingTemplate({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
