import { Chakra_Petch, Space_Grotesk } from "next/font/google";
import "./globals.css";

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra-petch",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "GATEWAYS — The Future of College Events",
  description:
    "A Minecraft-biome-themed college fest site: a 3D hero portal, events across biomes, and email-OTP-verified registration.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
