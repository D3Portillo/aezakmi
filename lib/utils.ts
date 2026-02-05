import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateUUID = () => crypto.randomUUID().replace(/-/g, "")

export const beautifyAddress = (addr: string, size = 4, separator = "...") =>
  `${addr.substr(0, size)}${separator}${addr.substr(-size, size)}`

export const jsonify = <T>(response: Response | Promise<Response>) => {
  return response instanceof Response
    ? (response.json() as Promise<T>)
    : response.then((r) => r.json() as Promise<T>)
}
