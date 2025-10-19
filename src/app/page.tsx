import { SpeedInsights } from "@vercel/speed-insights/next";
import App from "./components/App";
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <>
      <App />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
