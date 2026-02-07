import { Facehash, type FacehashProps } from "facehash"

export default function AddressBlock({ name, ...props }: FacehashProps) {
  return (
    <Facehash
      colors={["#d62828", "#3aff6b", "#7b5cff", "#ffae03"]}
      enableBlink
      name={name}
      size="100%"
      {...props}
    />
  )
}
