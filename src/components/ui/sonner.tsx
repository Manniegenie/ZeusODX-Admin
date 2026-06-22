import { Toaster as Sonner, type ToasterProps } from "sonner"
import { useTheme } from "@/core/hooks/useTheme"
import "./sonner.css"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      {...props}
    />
  )
}

export { Toaster }
