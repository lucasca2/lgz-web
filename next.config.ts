import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  experimental: {
    // Desliga o filesystem cache do Turbopack em dev (ligado por padrão no Next 16.1+).
    // Ele corrompe o `.next` quando muitos arquivos mudam durante uma compilação
    // (padrão ao editar com agentes), gerando erros de "[turbopack]_runtime.js"
    // e "Unable to write SST file". Trade-off: cold start de dev um pouco mais lento.
    turbopackFileSystemCacheForDev: false,
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
